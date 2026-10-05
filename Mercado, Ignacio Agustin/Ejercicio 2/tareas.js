import express from "express";
import { db } from "./db.js";
import {
  validarId,
  validarConsultaEstado,
  validarCrearTarea,
  validarActualizarTarea,
  verificarValidaciones,
} from "./validaciones.js";

const router = express.Router();

// GET /tareas?completada=true|false
router.get("/", validarConsultaEstado, verificarValidaciones, async (req, res) => {
  try {
    const { completada } = req.query;
    let sql = "SELECT id, nombre, completada FROM tareas";
    const params = [];

    if (completada !== undefined) {
      const esCompletada = completada === "true" || completada === "1";
      sql += " WHERE completada = ?";
      params.push(esCompletada ? 1 : 0);
    }

    const [filas] = await db.execute(sql, params);
    
    // Mapear el valor de MySQL (0/1) a booleano real en JSON
    const resultado = filas.map((t) => ({
      ...t,
      completada: Boolean(t.completada),
    }));

    res.json(resultado);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al obtener las tareas", error: error.message });
  }
});

// GET /tareas/:id
router.get("/:id", validarId, verificarValidaciones, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const [filas] = await db.execute("SELECT id, nombre, completada FROM tareas WHERE id = ?", [id]);

    if (filas.length === 0) {
      return res.status(404).json({ mensaje: "Tarea no encontrada" });
    }

    res.json({
      ...filas[0],
      completada: Boolean(filas[0].completada),
    });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al consultar la tarea", error: error.message });
  }
});

// POST /tareas
router.post("/", validarCrearTarea, verificarValidaciones, async (req, res) => {
  try {
    const { nombre, completada = false } = req.body;

    const [resultado] = await db.execute(
      "INSERT INTO tareas (nombre, completada) VALUES (?, ?)",
      [nombre, completada ? 1 : 0]
    );

    res.status(201).json({
      id: resultado.insertId,
      nombre,
      completada: Boolean(completada),
    });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al registrar la tarea", error: error.message });
  }
});

// PUT /tareas/:id
router.put("/:id", validarActualizarTarea, verificarValidaciones, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { nombre, completada } = req.body;

    // Verificar existencia previa
    const [existente] = await db.execute("SELECT * FROM tareas WHERE id = ?", [id]);
    if (existente.length === 0) {
      return res.status(404).json({ mensaje: "Tarea no encontrada" });
    }

    const nombreFinal = nombre !== undefined ? nombre : existente[0].nombre;
    const completadaFinal = completada !== undefined ? (completada ? 1 : 0) : existente[0].completada;

    await db.execute(
      "UPDATE tareas SET nombre = ?, completada = ? WHERE id = ?",
      [nombreFinal, completadaFinal, id]
    );

    res.json({
      id,
      nombre: nombreFinal,
      completada: Boolean(completadaFinal),
    });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al actualizar la tarea", error: error.message });
  }
});

// DELETE /tareas/:id
router.delete("/:id", validarId, verificarValidaciones, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const [resultado] = await db.execute("DELETE FROM tareas WHERE id = ?", [id]);

    if (resultado.affectedRows === 0) {
      return res.status(404).json({ mensaje: "Tarea no encontrada" });
    }

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ mensaje: "Error al eliminar la tarea", error: error.message });
  }
});

export default router;