import express from "express";
import { db } from "./db.js";
import { validarId, validarNombre, verificarValidaciones } from "./validaciones.js";

const router = express.Router();

async function existeNombre(nombre, idActual = null) {
  const sql =
    idActual === null
      ? "SELECT id FROM materias WHERE LOWER(nombre) = LOWER(?)"
      : "SELECT id FROM materias WHERE LOWER(nombre) = LOWER(?) AND id <> ?";
  const params = idActual === null ? [nombre] : [nombre, idActual];
  const [filas] = await db.execute(sql, params);
  return filas.length > 0;
}

router.get("/", async (req, res) => {
  const [materias] = await db.execute("SELECT id, nombre FROM materias");
  res.send(materias);
});

router.get("/:id", validarId, verificarValidaciones, async (req, res) => {
  const id = Number(req.params.id);
  const [materias] = await db.execute("SELECT id, nombre FROM materias WHERE id = ?", [id]);

  if (materias.length === 0) {
    return res.status(404).send("Materia no encontrada");
  }

  res.send(materias[0]);
});

router.get("/:id/calificaciones", validarId, verificarValidaciones, async (req, res) => {
  const id = Number(req.params.id);
  const [materias] = await db.execute("SELECT id FROM materias WHERE id = ?", [id]);

  if (materias.length === 0) {
    return res.status(404).send("Materia no encontrada");
  }

  const [filas] = await db.execute(
    "SELECT c.id, a.nombre AS alumno, m.nombre AS materia, c.nota1, c.nota2, c.nota3 " +
      "FROM calificaciones c " +
      "JOIN alumnos a ON c.alumno_id = a.id " +
      "JOIN materias m ON c.materia_id = m.id " +
      "WHERE c.materia_id = ?",
    [id],
  );

  res.send(filas.map(enriquecerCalificacion));
});

router.post("/", validarNombre, verificarValidaciones, async (req, res) => {
  const nombre = req.body.nombre.trim();

  if (await existeNombre(nombre)) {
    return res.status(409).json({ mensaje: "Ya existe una materia con ese nombre" });
  }

  const [result] = await db.execute("INSERT INTO materias (nombre) VALUES (?)", [nombre]);
  res.status(201).send({ id: result.insertId, nombre });
});

router.put("/:id", validarId, validarNombre, verificarValidaciones, async (req, res) => {
  const id = Number(req.params.id);
  const [existentes] = await db.execute("SELECT id FROM materias WHERE id = ?", [id]);

  if (existentes.length === 0) {
    return res.status(404).send("Materia no encontrada");
  }

  const nombre = req.body.nombre.trim();

  if (await existeNombre(nombre, id)) {
    return res.status(409).json({ mensaje: "Ya existe una materia con ese nombre" });
  }

  await db.execute("UPDATE materias SET nombre = ? WHERE id = ?", [nombre, id]);
  res.send({ id, nombre });
});

router.delete("/:id", validarId, verificarValidaciones, async (req, res) => {
  const id = Number(req.params.id);
  const [materias] = await db.execute("SELECT id, nombre FROM materias WHERE id = ?", [id]);

  if (materias.length === 0) {
    return res.status(404).send("Materia no encontrada");
  }

  try {
    await db.execute("DELETE FROM materias WHERE id = ?", [id]);
  } catch (e) {
    if (e.errno === 1451) {
      return res.status(409).json({
        mensaje: "No se puede eliminar la materia porque tiene calificaciones",
      });
    }
    throw e;
  }

  res.send(materias[0]);
});

function enriquecerCalificacion(fila) {
  const notas = [Number(fila.nota1), Number(fila.nota2), Number(fila.nota3)];
  const promedio = Number(((notas[0] + notas[1] + notas[2]) / 3).toFixed(2));
  let condicion = "promocionado";
  if (promedio < 6) condicion = "reprobado";
  else if (promedio < 8) condicion = "aprobado";

  return {
    id: fila.id,
    alumno: fila.alumno,
    materia: fila.materia,
    notas,
    promedio,
    condicion,
  };
}

export default router;
