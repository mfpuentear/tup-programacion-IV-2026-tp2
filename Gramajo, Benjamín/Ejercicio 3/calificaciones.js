import express from "express";
import { db } from "./db.js";
import {
  validarId,
  validarCalificacion,
  verificarValidaciones,
} from "./validaciones.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const [calificaciones] = await db.execute(
    "SELECT c.id, c.alumno, m.nombre AS materia, c.nota1, c.nota2, c.nota3 " +
      "FROM calificaciones c JOIN materias m ON c.materia_id = m.id " +
      "ORDER BY c.id ASC",
  );
  res.send(calificaciones);
});

router.get("/:id", validarId, verificarValidaciones, async (req, res) => {
  const id = Number(req.params.id);
  const [calificaciones] = await db.execute(
    "SELECT c.id, c.alumno, m.nombre AS materia, c.nota1, c.nota2, c.nota3 " +
      "FROM calificaciones c JOIN materias m ON c.materia_id = m.id " +
      "WHERE c.id = ?",
    [id],
  );
  if (calificaciones.length === 0) {
    return res.status(404).send("Calificación no encontrada");
  }
  res.send(calificaciones[0]);
});

router.post(
  "/",
  validarCalificacion,
  verificarValidaciones,
  async (req, res) => {
    const alumno = req.body.alumno.trim();
    const { materiaId, nota1, nota2, nota3 } = req.body;

    // Verifico que la materia exista
    const [materias] = await db.execute(
      "SELECT id FROM materias WHERE id = ?",
      [materiaId],
    );
    if (materias.length === 0) {
      return res.status(404).send("La materia indicada no existe");
    }

    // Verifico que no exista ya un registro para este alumno y esta materia
    const [existentes] = await db.execute(
      "SELECT id FROM calificaciones WHERE LOWER(TRIM(alumno)) = ? AND materia_id = ?",
      [alumno.toLowerCase(), materiaId],
    );
    if (existentes.length > 0) {
      return res
        .status(409)
        .send(
          "Ya existe un registro de calificación para este alumno en esta materia",
        );
    }

    const [result] = await db.execute(
      "INSERT INTO calificaciones (alumno, materia_id, nota1, nota2, nota3) VALUES (?, ?, ?, ?, ?)",
      [alumno, materiaId, nota1, nota2, nota3],
    );

    res
      .status(201)
      .send({ id: result.insertId, alumno, materiaId, nota1, nota2, nota3 });
  },
);

router.put(
  "/:id",
  validarId,
  validarCalificacion,
  verificarValidaciones,
  async (req, res) => {
    const id = Number(req.params.id);
    const alumno = req.body.alumno.trim();
    const { materiaId, nota1, nota2, nota3 } = req.body;

    const [materias] = await db.execute(
      "SELECT id FROM materias WHERE id = ?",
      [materiaId],
    );
    if (materias.length === 0) {
      return res.status(404).send("La materia indicada no existe");
    }

    // Verifico que no choque con OTRO registro existente (excluyendo el propio)
    const [existentes] = await db.execute(
      "SELECT id FROM calificaciones WHERE LOWER(TRIM(alumno)) = ? AND materia_id = ? AND id != ?",
      [alumno.toLowerCase(), materiaId, id],
    );
    if (existentes.length > 0) {
      return res
        .status(409)
        .send(
          "Ya existe otro registro de calificación para este alumno en esta materia",
        );
    }

    const [result] = await db.execute(
      "UPDATE calificaciones SET alumno = ?, materia_id = ?, nota1 = ?, nota2 = ?, nota3 = ? WHERE id = ?",
      [alumno, materiaId, nota1, nota2, nota3, id],
    );

    if (result.affectedRows === 0) {
      return res.status(404).send("Calificación no encontrada");
    }

    res.send({ id, alumno, materiaId, nota1, nota2, nota3 });
  },
);

router.delete("/:id", validarId, verificarValidaciones, async (req, res) => {
  const id = Number(req.params.id);
  const [result] = await db.execute("DELETE FROM calificaciones WHERE id = ?", [
    id,
  ]);
  if (result.affectedRows === 0) {
    return res.status(404).send("Calificación no encontrada");
  }
  res.send({ mensaje: "Calificación eliminada" });
});

export default router;
