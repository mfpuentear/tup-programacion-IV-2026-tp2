import express from "express";
import { db } from "./db.js";
import { validarAlumno, validarId, verificarValidaciones } from "./validaciones.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const [alumnos] = await db.execute("SELECT * FROM alumnos");
  res.send(alumnos);
});

router.get("/:id", validarId, verificarValidaciones, async (req, res) => {
  const id = Number(req.params.id);
  const [alumno] = await db.execute("SELECT * FROM alumnos WHERE id=?", [id]);
  if (alumno.length === 0) {
    return res.status(404).send("alumno no encontrado");
  }
  res.send(alumno[0]);
});

router.post("/", validarAlumno, verificarValidaciones, async (req, res) => {
  let { nombre } = req.body;
  nombre = nombre.trim();

  const [existe] = await db.execute("SELECT * FROM alumnos WHERE LOWER(nombre)=?", [nombre]);
  if (existe.length > 0) {
    return res.status(400).send("ya existe un alumno con ese nombre");
  }

  const [result] = await db.execute("INSERT INTO alumnos (nombre) VALUES (?)", [nombre]);
  res.status(201).send({ id: result.insertId, nombre });
});

router.put("/:id", [validarId, ...validarAlumno], verificarValidaciones, async (req, res) => {
  const id = Number(req.params.id);
  let { nombre } = req.body;
  nombre = nombre.trim();

  const [existe] = await db.execute("SELECT * FROM alumnos WHERE LOWER(nombre)=? AND id<>?", [nombre, id]);
  if (existe.length > 0) {
    return res.status(400).send("ya existe otro alumno con ese nombre");
  }

  const [result] = await db.execute("UPDATE alumnos SET nombre=? WHERE id=?", [nombre, id]);
  if (result.affectedRows === 0) {
    return res.status(404).send("alumno no encontrado");
  }

  res.send({ id, nombre });
});

router.delete("/:id", validarId, verificarValidaciones, async (req, res) => {
  const id = Number(req.params.id);
  const [result] = await db.execute("DELETE FROM alumnos WHERE id=?", [id]);
  if (result.affectedRows === 0) {
    return res.status(404).send("alumno no encontrado");
  }
  res.send("alumno eliminado");
});

export default router;
