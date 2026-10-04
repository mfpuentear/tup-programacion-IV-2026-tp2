import express from "express";
import { body, param, validationResult } from "express-validator";
import { pool } from "./db.js";

const app = express();
const port = 3001;

app.use(express.json());

const validarCampos = (req, res, next) => {
  const errores = validationResult(req);
  if (!errores.isEmpty()) {
    return res.status(400).json({ errores: errores.array() });
  }
  next();
};

const validacionRectangulo = [
  body("lado1")
    .isFloat({ gt: 0 })
    .withMessage("El lado1 debe ser un número mayor a 0"),
  body("lado2")
    .isFloat({ gt: 0 })
    .withMessage("El lado2 debe ser un número mayor a 0"),
  validarCampos,
];

const validacionId = [
  param("id").isInt({ gt: 0 }).withMessage("El ID debe ser un entero positivo"),
  validarCampos,
];

// Listar todos los rectángulos
app.get("/rectangulos", async (req, res) => {
  try {
    const [filas] = await pool.query("SELECT * FROM rectangulos");
    res.json(filas);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al consultar la base de datos", detalle: error.message });
  }
});

// Obtener rectángulo por ID
app.get("/rectangulos/:id", validacionId, async (req, res) => {
  try {
    const [filas] = await pool.query("SELECT * FROM rectangulos WHERE id = ?", [req.params.id]);
    if (filas.length === 0) {
      return res.status(404).json({ mensaje: "Rectángulo no encontrado" });
    }
    res.json(filas[0]);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al consultar el recurso", detalle: error.message });
  }
});

// Crear nuevo rectángulo calculando perímetro y superficie
app.post("/rectangulos", validacionRectangulo, async (req, res) => {
  try {
    const lado1 = parseFloat(req.body.lado1);
    const lado2 = parseFloat(req.body.lado2);
    const perimetro = 2 * (lado1 + lado2);
    const superficie = lado1 * lado2;

    const [resultado] = await pool.query(
      "INSERT INTO rectangulos (lado1, lado2, perimetro, superficie) VALUES (?, ?, ?, ?)",
      [lado1, lado2, perimetro, superficie]
    );

    res.status(201).json({ id: resultado.insertId, lado1, lado2, perimetro, superficie });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al registrar el rectángulo", detalle: error.message });
  }
});

// Modificar lados y recalcular derivadas
app.put("/rectangulos/:id", [...validacionId, ...validacionRectangulo], async (req, res) => {
  try {
    const id = req.params.id;
    const [existente] = await pool.query("SELECT * FROM rectangulos WHERE id = ?", [id]);
    if (existente.length === 0) {
      return res.status(404).json({ mensaje: "Rectángulo no encontrado" });
    }

    const lado1 = parseFloat(req.body.lado1);
    const lado2 = parseFloat(req.body.lado2);
    const perimetro = 2 * (lado1 + lado2);
    const superficie = lado1 * lado2;

    await pool.query(
      "UPDATE rectangulos SET lado1 = ?, lado2 = ?, perimetro = ?, superficie = ? WHERE id = ?",
      [lado1, lado2, perimetro, superficie, id]
    );

    res.json({ id: Number(id), lado1, lado2, perimetro, superficie });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al actualizar el rectángulo", detalle: error.message });
  }
});

// Eliminar rectángulo
app.delete("/rectangulos/:id", validacionId, async (req, res) => {
  try {
    const [resultado] = await pool.query("DELETE FROM rectangulos WHERE id = ?", [req.params.id]);
    if (resultado.affectedRows === 0) {
      return res.status(404).json({ mensaje: "Rectángulo no encontrado" });
    }
    res.json({ mensaje: "Rectángulo eliminado correctamente" });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al eliminar el rectángulo", detalle: error.message });
  }
});

app.listen(port, () => console.log(`Servidor de Rectángulos corriendo en http://localhost:${port}`));