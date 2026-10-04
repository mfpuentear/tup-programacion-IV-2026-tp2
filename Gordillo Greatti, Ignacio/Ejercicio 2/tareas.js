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

// MySQL guarda BOOLEAN como 0/1, lo paso a true/false para responder
const formatear = (tarea) => ({ ...tarea, completada: tarea.completada === 1 });

const buscarPorId = async (id) => {
    const [rows] = await db.execute("SELECT * FROM tareas WHERE id = ?", [id]);
    return rows[0];
};

const validarId = param("id")
    .isInt({ min: 1 })
    .withMessage("El id tiene que ser un entero positivo")
    .toInt();

// Criterio de igualdad: se sacan los espacios de los extremos, los espacios
// repetidos del medio quedan en uno solo, y la comparación la hace MySQL sin
// distinguir mayúsculas ni acentos ("Comprar pan" = "comprar  PAN" = "cómprar pan")
const validarNombre = body("nombre")
    .exists()
    .withMessage("Falta el nombre")
    .bail()
    .isString()
    .withMessage("El nombre tiene que ser texto")
    .bail()
    .trim()
    .customSanitizer((nombre) => nombre.replace(/\s+/g, " "))
    .isLength({ min: 3, max: 100 })
    .withMessage("El nombre tiene que tener entre 3 y 100 caracteres")
    .bail()
    .custom(async (nombre, { req }) => {
        // al modificar, la tarea no choca consigo misma
        const id = Number(req.params.id) || 0;
        const [rows] = await db.execute("SELECT id FROM tareas WHERE nombre = ? AND id <> ?", [nombre, id]);
        if (rows.length > 0) {
            throw new Error("Ya existe una tarea con ese nombre");
        }
    });

// es función para que cada ruta tenga su propia validación
// (si no, el .optional() del POST también afectaba al PUT)
const validarCompletada = () =>
    body("completada")
        .custom((valor) => typeof valor === "boolean")
        .withMessage("completada tiene que ser true o false");

// GET /tareas?estado=completadas | pendientes
router.get(
    "/",
    query("estado")
        .optional()
        .isIn(["completadas", "pendientes"])
        .withMessage("estado tiene que ser 'completadas' o 'pendientes'"),
    verificarValidaciones,
    async (req, res) => {
        const { estado } = matchedData(req);

        let rows;
        if (estado === undefined) {
            [rows] = await db.execute("SELECT * FROM tareas");
        } else {
            [rows] = await db.execute("SELECT * FROM tareas WHERE completada = ?", [estado === "completadas"]);
        }

        res.json(rows.map(formatear));
    }
);

router.get("/:id", validarId, verificarValidaciones, async (req, res) => {
    const { id } = matchedData(req);
    const tarea = await buscarPorId(id);
    if (!tarea) {
        return res.status(404).json({ error: "Tarea no encontrada" });
    }
    res.json(formatear(tarea));
});

// completada es opcional al crear: si no viene, la tarea arranca pendiente
router.post("/", validarNombre, validarCompletada().optional(), verificarValidaciones, async (req, res) => {
    const { nombre, completada = false } = matchedData(req);

    const [result] = await db.execute("INSERT INTO tareas (nombre, completada) VALUES (?, ?)", [nombre, completada]);

    res.status(201).json(formatear(await buscarPorId(result.insertId)));
});

router.put("/:id", validarId, validarNombre, validarCompletada(), verificarValidaciones, async (req, res) => {
    const { id, nombre, completada } = matchedData(req);

    if (!(await buscarPorId(id))) {
        return res.status(404).json({ error: "Tarea no encontrada" });
    }

    await db.execute("UPDATE tareas SET nombre = ?, completada = ? WHERE id = ?", [nombre, completada, id]);

    res.json(formatear(await buscarPorId(id)));
});

router.delete("/:id", validarId, verificarValidaciones, async (req, res) => {
    const { id } = matchedData(req);
    const [result] = await db.execute("DELETE FROM tareas WHERE id = ?", [id]);
    if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Tarea no encontrada" });
    }
    res.status(204).end();
});

export default router;