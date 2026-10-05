import express from "express";
import db from "./db.js";
import {
  validarParamId,
  validarCalificacionBody,
  validarConsultaCalificaciones,
} from "./validaciones.js";

const router = express.Router();

// Auxiliar para formatear objeto con el promedio calculado
const formatearCalificacion = (row) => ({
  id: row.id,
  alumno: row.alumno,
  materia_id: row.materia_id,
  materia_nombre: row.materia_nombre || undefined,
  nota1: Number(row.nota1),
  nota2: Number(row.nota2),
  nota3: Number(row.nota3),
  promedio: Number(((Number(row.nota1) + Number(row.nota2) + Number(row.nota3)) / 3).toFixed(2)),
});

// GET /calificaciones
router.get("/", validarConsultaCalificaciones, async (req, res) => {
  try {
    const { materia_id, alumno } = req.query;
    let sql = `
      SELECT c.*, m.nombre AS materia_nombre 
      FROM calificaciones c
      JOIN materias m ON c.materia_id = m.id
    `;
    const params = [];
    const condiciones = [];

    if (materia_id) {
      condiciones.push("c.materia_id = ?");
      params.push(materia_id);
    }

    if (alumno) {
      condiciones.push("LOWER(c.alumno) LIKE LOWER(?)");
      params.push(`%${alumno.trim()}%`);
    }

    if (condiciones.length > 0) {
      sql += " WHERE " + condiciones.join(" AND ");
    }

    const [rows] = await db.query(sql, params);
    res.status(200).json(rows.map(formatearCalificacion));
  } catch (error) {
    res.status(500).json({ error: "Error en el servidor", detalle: error.message });
  }
});

// GET /calificaciones/:id
router.get("/:id", validarParamId, async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query(
      `SELECT c.*, m.nombre AS materia_nombre 
       FROM calificaciones c
       JOIN materias m ON c.materia_id = m.id 
       WHERE c.id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Registro de calificación no encontrado" });
    }

    res.status(200).json(formatearCalificacion(rows[0]));
  } catch (error) {
    res.status(500).json({ error: "Error en el servidor", detalle: error.message });
  }
});

// POST /calificaciones
router.post("/", validarCalificacionBody, async (req, res) => {
  try {
    const { alumno, materia_id, nota1, nota2, nota3 } = req.body;
    const alumnoNormalizado = alumno.trim();

    // 1. Validar que la materia exista en la BD
    const [materiaExiste] = await db.query("SELECT id FROM materias WHERE id = ?", [materia_id]);
    if (materiaExiste.length === 0) {
      return res.status(400).json({
        error: "Error de validación",
        detalles: [{ campo: "materia_id", mensaje: "La materia especificada no existe en la base de datos" }],
      });
    }

    // 2. Validar regla de unicidad (Alumno + Materia)
    const [unicidad] = await db.query(
      "SELECT id FROM calificaciones WHERE LOWER(TRIM(alumno)) = LOWER(?) AND materia_id = ?",
      [alumnoNormalizado, materia_id]
    );

    if (unicidad.length > 0) {
      return res.status(400).json({
        error: "Error de validación",
        detalles: [{ campo: "alumno", mensaje: "Ya existe un registro de calificaciones para este alumno en la materia seleccionada" }],
      });
    }

    const [result] = await db.query(
      "INSERT INTO calificaciones (alumno, materia_id, nota1, nota2, nota3) VALUES (?, ?, ?, ?, ?)",
      [alumnoNormalizado, materia_id, nota1, nota2, nota3]
    );

    res.status(201).json(
      formatearCalificacion({
        id: result.insertId,
        alumno: alumnoNormalizado,
        materia_id,
        nota1,
        nota2,
        nota3,
      })
    );
  } catch (error) {
    res.status(500).json({ error: "Error al registrar la calificación", detalle: error.message });
  }
});

// PUT /calificaciones/:id
router.put("/:id", validarParamId, validarCalificacionBody, async (req, res) => {
  try {
    const { id } = req.params;
    const { alumno, materia_id, nota1, nota2, nota3 } = req.body;
    const alumnoNormalizado = alumno.trim();

    // 1. Verificar existencia del registro a modificar
    const [registroExiste] = await db.query("SELECT id FROM calificaciones WHERE id = ?", [id]);
    if (registroExiste.length === 0) {
      return res.status(404).json({ error: "Registro de calificación no encontrado para actualizar" });
    }

    // 2. Validar que la materia exista
    const [materiaExiste] = await db.query("SELECT id FROM materias WHERE id = ?", [materia_id]);
    if (materiaExiste.length === 0) {
      return res.status(400).json({
        error: "Error de validación",
        detalles: [{ campo: "materia_id", mensaje: "La materia especificada no existe" }],
      });
    }

    // 3. Validar regla de unicidad excluyendo el ID actual
    const [duplicado] = await db.query(
      "SELECT id FROM calificaciones WHERE LOWER(TRIM(alumno)) = LOWER(?) AND materia_id = ? AND id != ?",
      [alumnoNormalizado, materia_id, id]
    );

    if (duplicado.length > 0) {
      return res.status(400).json({
        error: "Error de validación",
        detalles: [{ campo: "alumno", mensaje: "Ya existe otro registro asignado a este alumno en la misma materia" }],
      });
    }

    await db.query(
      "UPDATE calificaciones SET alumno = ?, materia_id = ?, nota1 = ?, nota2 = ?, nota3 = ? WHERE id = ?",
      [alumnoNormalizado, materia_id, nota1, nota2, nota3, id]
    );

    res.status(200).json(
      formatearCalificacion({
        id: Number(id),
        alumno: alumnoNormalizado,
        materia_id,
        nota1,
        nota2,
        nota3,
      })
    );
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar la calificación", detalle: error.message });
  }
});

// DELETE /calificaciones/:id
router.delete("/:id", validarParamId, async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.query("DELETE FROM calificaciones WHERE id = ?", [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Registro de calificación no encontrado para eliminar" });
    }

    res.status(200).json({ mensaje: "Registro de calificación eliminado exitosamente", id: Number(id) });
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar la calificación", detalle: error.message });
  }
});

export default router;