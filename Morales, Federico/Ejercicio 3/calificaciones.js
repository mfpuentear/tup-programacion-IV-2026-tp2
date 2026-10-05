import express from "express";
import { db } from "./db.js";
import {
  validarId,
  validarCalificacion,
  validarCalificacionUpdate,
  verificarValidaciones,
} from "./validaciones.js";

const router = express.Router();

// GET listar calificaciones
router.get("/", async (req, res) => {
  const [calificaciones] = await db.execute("SELECT * FROM calificaciones");
  res.send(calificaciones);
});

// GET consultar una calificacion puntual
router.get("/:id", validarId, verificarValidaciones, async (req, res) => {
  const id = Number(req.params.id);

  const [calificaciones] = await db.execute(
    "SELECT * FROM calificaciones WHERE id = ?",
    [id],
  );

  if (calificaciones.length === 0) {
    return res.status(404).send("Calificación no encontrada");
  }

  res.send(calificaciones[0]);
});

// POST crear una calificacion
router.post("/", validarCalificacion, verificarValidaciones, async (req, res) => {
  const { alumno, materia_id, nota1, nota2, nota3 } = req.body;
  const alumnoLimpio = alumno.trim();

  const [result] = await db.execute(
    `INSERT INTO calificaciones (alumno, materia_id, nota1, nota2, nota3)
     VALUES (?, ?, ?, ?, ?)`,
    [alumnoLimpio, materia_id, nota1, nota2, nota3],
  );

  res.status(201).send({
    id: result.insertId,
    alumno: alumnoLimpio,
    materia_id,
    nota1,
    nota2,
    nota3,
  });
});

// PUT modificar las notas de una calificacion
router.put(
  "/:id",
  [validarId, ...validarCalificacionUpdate],
  verificarValidaciones,
  async (req, res) => {
    const id = Number(req.params.id);
    const { nota1, nota2, nota3 } = req.body;

    const [result] = await db.execute(
      "UPDATE calificaciones SET nota1 = ?, nota2 = ?, nota3 = ? WHERE id = ?",
      [nota1, nota2, nota3, id],
    );

    if (result.affectedRows === 0) {
      return res.status(404).send("Calificación no encontrada");
    }

    res.send({ id, nota1, nota2, nota3 });
  },
);

// DELETE borrar una calificacion
router.delete("/:id", validarId, verificarValidaciones, async (req, res) => {
  const id = Number(req.params.id);

  const [result] = await db.execute("DELETE FROM calificaciones WHERE id = ?", [id]);

  if (result.affectedRows === 0) {
    return res.status(404).send("Calificación no encontrada");
  }

  res.status(204).send();
});

export default router;