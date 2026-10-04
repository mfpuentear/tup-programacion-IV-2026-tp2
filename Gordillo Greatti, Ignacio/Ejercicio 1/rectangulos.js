import express from "express";
import { body, param, query, validationResult, matchedData } from "express-validator";
import { db } from "./db.js";

const router = express.Router();

const verificarValidaciones = (req, res, next) => {
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
        return res.status(400).json({ errores: errores.array() });
    }
    next();
};

const validarId = param("id")
    .isInt({ min: 1 })
    .withMessage("El id tiene que ser un entero positivo")
    .toInt();

const validarLado = (campo) =>
    body(campo)
        .exists()
        .withMessage(`Falta ${campo}`)
        .bail()
        .isFloat({ gt: 0, max: 1000000 })
        .withMessage(`${campo} tiene que ser un número mayor que 0 y hasta 1000000`)
        .bail()
        .isDecimal({ decimal_digits: "0,2" })
        .withMessage(`${campo} admite como máximo 2 decimales`)
        .toFloat();

// perimetro y superficie los calcula el servidor, si los mandan es un error
const rechazarCalculados = [
    body("perimetro").not().exists().withMessage("El perímetro no se envía, lo calcula la API"),
    body("superficie").not().exists().withMessage("La superficie no se envía, la calcula la API"),
];

const validarRectangulo = [validarLado("base"), validarLado("altura"), ...rechazarCalculados];

const calcular = (base, altura) => ({
    perimetro: 2 * (base + altura),
    superficie: base * altura,
});

const buscarPorId = async (id) => {
    const [rows] = await db.execute("SELECT * FROM rectangulos WHERE id = ?", [id]);
    return rows[0];
};

// GET /rectangulos?superficieMin=10&superficieMax=50
router.get(
    "/",
    query("superficieMin")
        .optional()
        .isFloat({ min: 0 })
        .withMessage("superficieMin tiene que ser un número >= 0")
        .toFloat(),
    query("superficieMax")
        .optional()
        .isFloat({ min: 0 })
        .withMessage("superficieMax tiene que ser un número >= 0")
        .bail()
        .custom((max, { req }) => {
            const min = req.query.superficieMin;
            if (min !== undefined && Number(max) < Number(min)) {
                throw new Error("superficieMax no puede ser menor que superficieMin");
            }
            return true;
        })
        .toFloat(),
    verificarValidaciones,
    async (req, res) => {
        const { superficieMin, superficieMax } = matchedData(req);

        let sql = "SELECT * FROM rectangulos WHERE 1 = 1";
        const valores = [];
        if (superficieMin !== undefined) {
            sql += " AND superficie >= ?";
            valores.push(superficieMin);
        }
        if (superficieMax !== undefined) {
            sql += " AND superficie <= ?";
            valores.push(superficieMax);
        }

        const [rows] = await db.execute(sql, valores);
        res.json(rows);
    }
);

router.get("/:id", validarId, verificarValidaciones, async (req, res) => {
    const { id } = matchedData(req);
    const rectangulo = await buscarPorId(id);
    if (!rectangulo) {
        return res.status(404).json({ error: "Rectángulo no encontrado" });
    }
    res.json(rectangulo);
});

router.post("/", validarRectangulo, verificarValidaciones, async (req, res) => {
    const { base, altura } = matchedData(req);
    const { perimetro, superficie } = calcular(base, altura);

    const [result] = await db.execute(
        "INSERT INTO rectangulos (base, altura, perimetro, superficie) VALUES (?, ?, ?, ?)",
        [base, altura, perimetro, superficie]
    );

    res.status(201).json(await buscarPorId(result.insertId));
});

router.put("/:id", validarId, validarRectangulo, verificarValidaciones, async (req, res) => {
    const { id, base, altura } = matchedData(req);

    if (!(await buscarPorId(id))) {
        return res.status(404).json({ error: "Rectángulo no encontrado" });
    }

    const { perimetro, superficie } = calcular(base, altura);
    await db.execute(
        "UPDATE rectangulos SET base = ?, altura = ?, perimetro = ?, superficie = ? WHERE id = ?",
        [base, altura, perimetro, superficie, id]
    );

    res.json(await buscarPorId(id));
});

router.delete("/:id", validarId, verificarValidaciones, async (req, res) => {
    const { id } = matchedData(req);
    const [result] = await db.execute("DELETE FROM rectangulos WHERE id = ?", [id]);
    if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Rectángulo no encontrado" });
    }
    res.status(204).end();
});

export default router;