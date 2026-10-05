import express from "express";
import db from "./db.js";
import {
  validarParamId,
  validarRectanguloBody,
  validarConsultaQuery,
} from "./validaciones.js";

const router = express.Router();

// Función interna para calcular perímetro y superficie
const calcularPropiedades = (lado1, lado2) => {
  const l1 = Number(lado1);
  const l2 = Number(lado2);
  const perimetro = 2 * (l1 + l2);
  const superficie = l1 * l2;
  return { perimetro, superficie };
};

// GET /rectangulos
router.get("/", validarConsultaQuery, async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM rectangulos");
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ error: "Error en el servidor", detalle: error.message });
  }
});

// GET /rectangulos/:id
router.get("/:id", validarParamId, async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query("SELECT * FROM rectangulos WHERE id = ?", [id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: "Rectángulo no encontrado" });
    }

    res.status(200).json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Error en el servidor", detalle: error.message });
  }
});

// POST /rectangulos
router.post("/", validarRectanguloBody, async (req, res) => {
  try {
    const { lado1, lado2 } = req.body;
    const { perimetro, superficie } = calcularPropiedades(lado1, lado2);

    const [result] = await db.query(
      "INSERT INTO rectangulos (lado1, lado2, perimetro, superficie) VALUES (?, ?, ?, ?)",
      [lado1, lado2, perimetro, superficie]
    );

    res.status(201).json({
      id: result.insertId,
      lado1: Number(lado1),
      lado2: Number(lado2),
      perimetro,
      superficie,
    });
  } catch (error) {
    res.status(500).json({ error: "Error al guardar el rectángulo", detalle: error.message });
  }
});

// PUT /rectangulos/:id
router.put("/:id", validarParamId, validarRectanguloBody, async (req, res) => {
  try {
    const { id } = req.params;
    const { lado1, lado2 } = req.body;

    const [existe] = await db.query("SELECT id FROM rectangulos WHERE id = ?", [id]);
    if (existe.length === 0) {
      return res.status(404).json({ error: "Rectángulo no encontrado para actualizar" });
    }

    const { perimetro, superficie } = calcularPropiedades(lado1, lado2);

    await db.query(
      "UPDATE rectangulos SET lado1 = ?, lado2 = ?, perimetro = ?, superficie = ? WHERE id = ?",
      [lado1, lado2, perimetro, superficie, id]
    );

    res.status(200).json({
      id: Number(id),
      lado1: Number(lado1),
      lado2: Number(lado2),
      perimetro,
      superficie,
    });
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar el rectángulo", detalle: error.message });
  }
});

// DELETE /rectangulos/:id
router.delete("/:id", validarParamId, async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.query("DELETE FROM rectangulos WHERE id = ?", [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Rectángulo no encontrado para eliminar" });
    }

    res.status(200).json({ mensaje: "Rectángulo eliminado exitosamente", id: Number(id) });
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar el rectángulo", detalle: error.message });
  }
});

export default router;