import express from "express";
import { body, param, validationResult } from "express-validator";
import { pool } from "../../db.js";

const app = express();
const PORT = 3000;

app.use(express.json());

// ---------- Validaciones ----------
const validarLado = (campo) =>
  body(campo)
    .exists({ checkFalsy: false })
    .withMessage(`'${campo}' es obligatorio`)
    .bail()
    .isFloat({ gt: 0 })
    .withMessage(`'${campo}' debe ser un número mayor que 0`)
    .toFloat();

const validarCrearORemplazar = [validarLado("lado_a"), validarLado("lado_b")];

const validarId = [
  param("id")
    .isInt({ gt: 0 })
    .withMessage("El id debe ser un entero positivo")
    .toInt(),
];

function manejarValidacion(req, res, next) {
  const errores = validationResult(req);
  if (!errores.isEmpty()) {
    return res.status(400).json({ errores: errores.array().map((e) => e.msg) });
  }
  next();
}

// ---------- Lógica ----------
const calcularPerimetro = (a, b) => Number((2 * (a + b)).toFixed(2));
const calcularSuperficie = (a, b) => Number((a * b).toFixed(2));

// ---------- Rutas ----------
const router = express.Router();

// Listar todos los rectángulos
router.get("/", async (req, res, next) => {
  try {
    const [filas] = await pool.query("SELECT * FROM rectangulos ORDER BY id");
    res.json(filas);
  } catch (err) {
    next(err);
  }
});

// Consultar un rectángulo
router.get("/:id", validarId, manejarValidacion, async (req, res, next) => {
  try {
    const [filas] = await pool.query("SELECT * FROM rectangulos WHERE id = ?", [
      req.params.id,
    ]);
    if (filas.length === 0) {
      return res.status(404).json({ error: "Rectángulo no encontrado" });
    }
    res.json(filas[0]);
  } catch (err) {
    next(err);
  }
});

// Crear un rectángulo
router.post(
  "/",
  validarCrearORemplazar,
  manejarValidacion,
  async (req, res, next) => {
    try {
      const { lado_a, lado_b } = req.body;
      const perimetro = calcularPerimetro(lado_a, lado_b);
      const superficie = calcularSuperficie(lado_a, lado_b);

      const [resultado] = await pool.query(
        "INSERT INTO rectangulos (lado_a, lado_b, perimetro, superficie) VALUES (?, ?, ?, ?)",
        [lado_a, lado_b, perimetro, superficie],
      );

      res.status(201).location(`/rectangulos/${resultado.insertId}`).json({
        id: resultado.insertId,
        lado_a,
        lado_b,
        perimetro,
        superficie,
      });
    } catch (err) {
      next(err);
    }
  },
);

// Modificar un rectángulo
router.put(
  "/:id",
  [...validarId, ...validarCrearORemplazar],
  manejarValidacion,
  async (req, res, next) => {
    try {
      const { lado_a, lado_b } = req.body;
      const perimetro = calcularPerimetro(lado_a, lado_b);
      const superficie = calcularSuperficie(lado_a, lado_b);

      const [resultado] = await pool.query(
        "UPDATE rectangulos SET lado_a = ?, lado_b = ?, perimetro = ?, superficie = ? WHERE id = ?",
        [lado_a, lado_b, perimetro, superficie, req.params.id],
      );

      if (resultado.affectedRows === 0) {
        return res.status(404).json({ error: "Rectángulo no encontrado" });
      }

      res.json({
        id: Number(req.params.id),
        lado_a,
        lado_b,
        perimetro,
        superficie,
      });
    } catch (err) {
      next(err);
    }
  },
);

// Eliminar un rectángulo
router.delete("/:id", validarId, manejarValidacion, async (req, res, next) => {
  try {
    const [resultado] = await pool.query(
      "DELETE FROM rectangulos WHERE id = ?",
      [req.params.id],
    );
    if (resultado.affectedRows === 0) {
      return res.status(404).json({ error: "Rectángulo no encontrado" });
    }
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

app.use("/rectangulos", router);

// ---------- 404 y errores ----------
app.use((req, res) => {
  res.status(404).json({ error: "Ruta no encontrada" });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Error interno del servidor" });
});

app.listen(PORT, () => console.log(`Ejercicio 1 en http://localhost:${PORT}`));
