import express from "express";
import { db } from "./db.js";
import {
  validarId,
  validarRectangulo,
  verificarValidaciones,
} from "./validaciones.js";

const router = express.Router();

// GET /rectangulos - Obtener todos los rectangulos
router.get("/", async (req, res) => {
  try {
    const [filas] = await db.execute("SELECT * FROM rectangulos");
    res.json(filas);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al obtener los rectángulos", error: error.message });
  }
});

// GET /rectangulos/:id - Obtener un rectangulo por ID
router.get("/:id", validarId, verificarValidaciones, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const [filas] = await db.execute("SELECT * FROM rectangulos WHERE id = ?", [id]);

    if (filas.length === 0) {
      return res.status(404).json({ mensaje: "Rectángulo no encontrado" });
    }

    res.json(filas[0]);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al obtener el rectángulo", error: error.message });
  }
});

// POST /rectangulos - Crear nuevo rectangulo
router.post("/", validarRectangulo, verificarValidaciones, async (req, res) => {
  try {
    const lado1 = parseFloat(req.body.lado1);
    const lado2 = parseFloat(req.body.lado2);

    // Calculos estrictamente en el servidor
    const perimetro = 2 * (lado1 + lado2);
    const superficie = lado1 * lado2;

    const [resultado] = await db.execute(
      "INSERT INTO rectangulos (lado1, lado2, perimetro, superficie) VALUES (?, ?, ?, ?)",
      [lado1, lado2, perimetro, superficie]
    );

    res.status(201).json({
      id: resultado.insertId,
      lado1,
      lado2,
      perimetro,
      superficie,
    });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al crear el rectángulo", error: error.message });
  }
});

// PUT /rectangulos/:id - Actualizar rectangulo
router.put(
  "/:id",
  validarId,
  validarRectangulo,
  verificarValidaciones,
  async (req, res) => {
    try {
      const id = Number(req.params.id);
      const lado1 = parseFloat(req.body.lado1);
      const lado2 = parseFloat(req.body.lado2);

      // Recalculamos valores
      const perimetro = 2 * (lado1 + lado2);
      const superficie = lado1 * lado2;

      const [resultado] = await db.execute(
        "UPDATE rectangulos SET lado1 = ?, lado2 = ?, perimetro = ?, superficie = ? WHERE id = ?",
        [lado1, lado2, perimetro, superficie, id]
      );

      if (resultado.affectedRows === 0) {
        return res.status(404).json({ mensaje: "Rectángulo no encontrado" });
      }

      res.json({
        id,
        lado1,
        lado2,
        perimetro,
        superficie,
      });
    } catch (error) {
      res.status(500).json({ mensaje: "Error al actualizar el rectángulo", error: error.message });
    }
  }
);

// DELETE /rectangulos/:id - Eliminar rectangulo
router.delete("/:id", validarId, verificarValidaciones, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const [resultado] = await db.execute("DELETE FROM rectangulos WHERE id = ?", [id]);

    if (resultado.affectedRows === 0) {
      return res.status(404).json({ mensaje: "Rectángulo no encontrado" });
    }

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ mensaje: "Error al eliminar el rectángulo", error: error.message });
  }
});

export default router;