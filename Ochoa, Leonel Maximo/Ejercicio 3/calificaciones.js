import express from "express";
import { db } from "./db.js";
import {
  validarId,
  validarFiltrosCalificaciones,
  validarCalificacion,
  verificarValidaciones,
} from "./validaciones.js";

const router = express.Router();

const sqlDetalle =
  "SELECT c.id, c.alumno_id, c.materia_id, a.nombre AS alumno, m.nombre AS materia, " +
  "c.nota1, c.nota2, c.nota3 " +
  "FROM calificaciones c " +
  "JOIN alumnos a ON c.alumno_id = a.id " +
  "JOIN materias m ON c.materia_id = m.id";

function enriquecer(fila) {
  const notas = [Number(fila.nota1), Number(fila.nota2), Number(fila.nota3)];
  const promedio = Number(((notas[0] + notas[1] + notas[2]) / 3).toFixed(2));
  let condicion = "promocionado";
  if (promedio < 6) condicion = "reprobado";
  else if (promedio < 8) condicion = "aprobado";

  return {
    id: fila.id,
    alumnoId: fila.alumno_id,
    materiaId: fila.materia_id,
    alumno: fila.alumno,
    materia: fila.materia,
    notas,
    promedio,
    condicion,
  };
}

async function existePar(alumnoId, materiaId, idActual = null) {
  const sql =
    idActual === null
      ? "SELECT id FROM calificaciones WHERE alumno_id = ? AND materia_id = ?"
      : "SELECT id FROM calificaciones WHERE alumno_id = ? AND materia_id = ? AND id <> ?";
  const params = idActual === null ? [alumnoId, materiaId] : [alumnoId, materiaId, idActual];
  const [filas] = await db.execute(sql, params);
  return filas.length > 0;
}

router.get("/", validarFiltrosCalificaciones, verificarValidaciones, async (req, res) => {
  const filtros = [];
  const parametros = [];

  if (req.query.alumnoId) {
    filtros.push("c.alumno_id = ?");
    parametros.push(Number(req.query.alumnoId));
  }
  if (req.query.materiaId) {
    filtros.push("c.materia_id = ?");
    parametros.push(Number(req.query.materiaId));
  }

  let sql = sqlDetalle;
  if (filtros.length > 0) {
    sql += " WHERE " + filtros.join(" AND ");
  }

  const [filas] = await db.execute(sql, parametros);
  res.send(filas.map(enriquecer));
});

router.get("/:id", validarId, verificarValidaciones, async (req, res) => {
  const id = Number(req.params.id);
  const [filas] = await db.execute(sqlDetalle + " WHERE c.id = ?", [id]);

  if (filas.length === 0) {
    return res.status(404).send("Calificación no encontrada");
  }

  res.send(enriquecer(filas[0]));
});

router.post("/", validarCalificacion, verificarValidaciones, async (req, res) => {
  const alumnoId = Number(req.body.alumnoId);
  const materiaId = Number(req.body.materiaId);
  const notas = req.body.notas.map(Number);

  const [alumnos] = await db.execute("SELECT id FROM alumnos WHERE id = ?", [alumnoId]);
  if (alumnos.length === 0) {
    return res.status(400).json({ mensaje: "El alumno no existe" });
  }

  const [materias] = await db.execute("SELECT id FROM materias WHERE id = ?", [materiaId]);
  if (materias.length === 0) {
    return res.status(400).json({ mensaje: "La materia no existe" });
  }

  if (await existePar(alumnoId, materiaId)) {
    return res.status(409).json({
      mensaje: "Ya existe una calificación para esa combinación de alumno y materia",
    });
  }

  const [result] = await db.execute(
    "INSERT INTO calificaciones (alumno_id, materia_id, nota1, nota2, nota3) VALUES (?, ?, ?, ?, ?)",
    [alumnoId, materiaId, notas[0], notas[1], notas[2]],
  );

  const [creadas] = await db.execute(sqlDetalle + " WHERE c.id = ?", [result.insertId]);
  res.status(201).send(enriquecer(creadas[0]));
});

router.put("/:id", validarId, validarCalificacion, verificarValidaciones, async (req, res) => {
  const id = Number(req.params.id);
  const [existentes] = await db.execute("SELECT id FROM calificaciones WHERE id = ?", [id]);

  if (existentes.length === 0) {
    return res.status(404).send("Calificación no encontrada");
  }

  const alumnoId = Number(req.body.alumnoId);
  const materiaId = Number(req.body.materiaId);
  const notas = req.body.notas.map(Number);

  const [alumnos] = await db.execute("SELECT id FROM alumnos WHERE id = ?", [alumnoId]);
  if (alumnos.length === 0) {
    return res.status(400).json({ mensaje: "El alumno no existe" });
  }

  const [materias] = await db.execute("SELECT id FROM materias WHERE id = ?", [materiaId]);
  if (materias.length === 0) {
    return res.status(400).json({ mensaje: "La materia no existe" });
  }

  if (await existePar(alumnoId, materiaId, id)) {
    return res.status(409).json({
      mensaje: "Ya existe una calificación para esa combinación de alumno y materia",
    });
  }

  await db.execute(
    "UPDATE calificaciones SET alumno_id = ?, materia_id = ?, nota1 = ?, nota2 = ?, nota3 = ? WHERE id = ?",
    [alumnoId, materiaId, notas[0], notas[1], notas[2], id],
  );

  const [actualizadas] = await db.execute(sqlDetalle + " WHERE c.id = ?", [id]);
  res.send(enriquecer(actualizadas[0]));
});

router.delete("/:id", validarId, verificarValidaciones, async (req, res) => {
  const id = Number(req.params.id);
  const [filas] = await db.execute(sqlDetalle + " WHERE c.id = ?", [id]);

  if (filas.length === 0) {
    return res.status(404).send("Calificación no encontrada");
  }

  await db.execute("DELETE FROM calificaciones WHERE id = ?", [id]);
  res.send(enriquecer(filas[0]));
});

export default router;
