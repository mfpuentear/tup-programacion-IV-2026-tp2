import express from "express";
import { db } from "./db.js";
import {
  validarId,
  validarCrearCalificacion,
  validarActualizarCalificacion,
  verificarValidaciones,
} from "./validaciones.js";

const router = express.Router();

// GET /calificaciones
router.get("/", async (req, res) => {
  try {
    const [filas] = await db.execute(`
      SELECT 
        c.id, 
        c.alumno, 
        c.materia_id, 
        m.nombre AS materia, 
        c.nota1, 
        c.nota2, 
        c.nota3,
        ROUND((c.nota1 + c.nota2 + c.nota3) / 3, 2) AS promedio
      FROM calificaciones c
      JOIN materias m ON c.materia_id = m.id
    `);

    // Castear notas a Number en JSON
    const resultado = filas.map((f) => ({
      ...f,
      nota1: Number(f.nota1),
      nota2: Number(f.nota2),
      nota3: Number(f.nota3),
      promedio: Number(f.promedio),
    }));

    res.json(resultado);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al obtener calificaciones", error: error.message });
  }
});

// GET /calificaciones/:id
router.get("/:id", validarId, verificarValidaciones, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const [filas] = await db.execute(`
      SELECT 
        c.id, 
        c.alumno, 
        c.materia_id, 
        m.nombre AS materia, 
        c.nota1, 
        c.nota2, 
        c.nota3,
        ROUND((c.nota1 + c.nota2 + c.nota3) / 3, 2) AS promedio
      FROM calificaciones c
      JOIN materias m ON c.materia_id = m.id
      WHERE c.id = ?
    `, [id]);

    if (filas.length === 0) {
      return res.status(404).json({ mensaje: "Registro de calificación no encontrado" });
    }

    const reg = filas[0];
    res.json({
      ...reg,
      nota1: Number(reg.nota1),
      nota2: Number(reg.nota2),
      nota3: Number(reg.nota3),
      promedio: Number(reg.promedio),
    });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al consultar la calificación", error: error.message });
  }
});

// POST /calificaciones
router.post("/", validarCrearCalificacion, verificarValidaciones, async (req, res) => {
  try {
    const { alumno, materia_id, nota1, nota2, nota3 } = req.body;

    const [resultado] = await db.execute(
      "INSERT INTO calificaciones (alumno, materia_id, nota1, nota2, nota3) VALUES (?, ?, ?, ?, ?)",
      [alumno, materia_id, nota1, nota2, nota3]
    );

    res.status(201).json({
      id: resultado.insertId,
      alumno,
      materia_id,
      nota1: Number(nota1),
      nota2: Number(nota2),
      nota3: Number(nota3),
    });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al guardar la calificación", error: error.message });
  }
});

// PUT /calificaciones/:id
router.put("/:id", validarActualizarCalificacion, verificarValidaciones, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const [existente] = await db.execute("SELECT * FROM calificaciones WHERE id = ?", [id]);

    if (existente.length === 0) {
      return res.status(404).json({ mensaje: "Registro de calificación no encontrado" });
    }

    const prev = existente[0];
    const alumnoFinal = req.body.alumno !== undefined ? req.body.alumno : prev.alumno;
    const materiaIdFinal = req.body.materia_id !== undefined ? req.body.materia_id : prev.materia_id;
    const nota1Final = req.body.nota1 !== undefined ? req.body.nota1 : prev.nota1;
    const nota2Final = req.body.nota2 !== undefined ? req.body.nota2 : prev.nota2;
    const nota3Final = req.body.nota3 !== undefined ? req.body.nota3 : prev.nota3;

    await db.execute(
      "UPDATE calificaciones SET alumno = ?, materia_id = ?, nota1 = ?, nota2 = ?, nota3 = ? WHERE id = ?",
      [alumnoFinal, materiaIdFinal, nota1Final, nota2Final, nota3Final, id]
    );

    res.json({
      id,
      alumno: alumnoFinal,
      materia_id: materiaIdFinal,
      nota1: Number(nota1Final),
      nota2: Number(nota2Final),
      nota3: Number(nota3Final),
    });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al actualizar la calificación", error: error.message });
  }
});

// DELETE /calificaciones/:id
router.delete("/:id", validarId, verificarValidaciones, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const [resultado] = await db.execute("DELETE FROM calificaciones WHERE id = ?", [id]);

    if (resultado.affectedRows === 0) {
      return res.status(404).json({ mensaje: "Registro de calificación no encontrado" });
    }

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ mensaje: "Error al eliminar la calificación", error: error.message });
  }
});

export default router;