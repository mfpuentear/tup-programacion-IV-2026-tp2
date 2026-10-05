import express from "express";
import db from "./db.js";
import {
  validarParamId,
  validarCrearTareaBody,
  validarActualizarTareaBody,
  validarConsultaQuery,
} from "./validaciones.js";

const router = express.Router();

// GET /tareas (con filtro opcional ?completada=true|false)
// GET /tareas (con filtro opcional ?completada=true|false)
router.get("/", validarConsultaQuery, async (req, res) => {
  try {
    let sql = "SELECT * FROM tareas";
    const params = [];

    if (req.query.completada !== undefined) {
      sql += " WHERE completada = ?";
      // Convertimos el string explicitamente a 1 (true) o 0 (false) para MySQL
      const esCompletada = req.query.completada === "true" || req.query.completada === "1";
      params.push(esCompletada ? 1 : 0);
    }

    const [rows] = await db.query(sql, params);

    const resultado = rows.map((t) => ({
      ...t,
      completada: Boolean(t.completada),
    }));

    res.status(200).json(resultado);
  } catch (error) {
    res.status(500).json({ error: "Error en el servidor", detalle: error.message });
  }
});

// GET /tareas/:id
router.get("/:id", validarParamId, async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query("SELECT * FROM tareas WHERE id = ?", [id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: "Tarea no encontrada" });
    }

    const tarea = {
      ...rows[0],
      completada: Boolean(rows[0].completada),
    };

    res.status(200).json(tarea);
  } catch (error) {
    res.status(500).json({ error: "Error en el servidor", detalle: error.message });
  }
});

// POST /tareas
router.post("/", validarCrearTareaBody, async (req, res) => {
  try {
    const { nombre, completada = false } = req.body;
    const nombreNormalizado = nombre.trim();

    // Verificar mayúsculas/minúsculas y espacios
    const [existente] = await db.query(
      "SELECT id FROM tareas WHERE LOWER(TRIM(nombre)) = LOWER(?)",
      [nombreNormalizado]
    );

    if (existente.length > 0) {
      return res.status(400).json({
        error: "Error de validación",
        detalles: [{ campo: "nombre", mensaje: "Ya existe una tarea registrada con ese mismo nombre" }],
      });
    }

    const [result] = await db.query(
      "INSERT INTO tareas (nombre, completada) VALUES (?, ?)",
      [nombreNormalizado, completada]
    );

    res.status(201).json({
      id: result.insertId,
      nombre: nombreNormalizado,
      completada: Boolean(completada),
    });
  } catch (error) {
    res.status(500).json({ error: "Error al crear la tarea", detalle: error.message });
  }
});

// PUT /tareas/:id
router.put("/:id", validarParamId, validarActualizarTareaBody, async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, completada } = req.body;
    const nombreNormalizado = nombre.trim();

    const [existe] = await db.query("SELECT id FROM tareas WHERE id = ?", [id]);
    if (existe.length === 0) {
      return res.status(404).json({ error: "Tarea no encontrada para actualizar" });
    }

    // Unicidad excluyendo la misma tarea que se está modificando
    const [duplicado] = await db.query(
      "SELECT id FROM tareas WHERE LOWER(TRIM(nombre)) = LOWER(?) AND id != ?",
      [nombreNormalizado, id]
    );

    if (duplicado.length > 0) {
      return res.status(400).json({
        error: "Error de validación",
        detalles: [{ campo: "nombre", mensaje: "Ya existe otra tarea registrada con ese mismo nombre" }],
      });
    }

    await db.query(
      "UPDATE tareas SET nombre = ?, completada = ? WHERE id = ?",
      [nombreNormalizado, completada, id]
    );

    res.status(200).json({
      id: Number(id),
      nombre: nombreNormalizado,
      completada: Boolean(completada),
    });
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar la tarea", detalle: error.message });
  }
});

// DELETE /tareas/:id
router.delete("/:id", validarParamId, async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.query("DELETE FROM tareas WHERE id = ?", [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Tarea no encontrada para eliminar" });
    }

    res.status(200).json({ mensaje: "Tarea eliminada exitosamente", id: Number(id) });
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar la tarea", detalle: error.message });
  }
});

export default router;