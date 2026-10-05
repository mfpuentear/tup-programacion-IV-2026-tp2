import express from "express";
import { db } from "./db.js";
import { representarCalificacion } from "./calificaciones.js";
import { validarId, validarMateria, verificarValidaciones } from "./validaciones.js";

const router = express.Router();

// GET listado de materias
router.get("/", async (req, res) => {
  const [materias] = await db.execute("SELECT id, nombre FROM materias");
  res.send(materias);
});

// GET detalle de una materia
router.get("/:id", validarId, verificarValidaciones, async (req, res) => {
  const id = Number(req.params.id);
  const [materias] = await db.execute("SELECT id, nombre FROM materias WHERE id = ?", [id]);
  if (materias.length === 0) {
    return res.status(404).send("Materia no encontrada");
  }
  res.send(materias[0]);
});

// POST para crear una materia
router.post("/", validarMateria, verificarValidaciones, async (req, res) => {
  const { nombre } = req.body;

  const [repetidas] = await db.execute(
    "SELECT id FROM materias WHERE LOWER(TRIM(nombre)) = LOWER(TRIM(?))",
    [nombre],
  );
  if (repetidas.length > 0) {
    return res.status(409).send("Ya existe una materia con ese nombre");
  }

  const [result] = await db.execute("INSERT INTO materias (nombre) VALUES (?)", [nombre.trim()]);
  res.status(201).send({ id: result.insertId, nombre: nombre.trim() });
});

// PUT para renombrar una materia
router.put("/:id", validarId, validarMateria, verificarValidaciones, async (req, res) => {
  const id = Number(req.params.id);

  const [existentes] = await db.execute("SELECT id FROM materias WHERE id = ?", [id]);
  if (existentes.length === 0) {
    return res.status(404).send("Materia no encontrada");
  }

  const { nombre } = req.body;
  const [repetidas] = await db.execute(
    "SELECT id FROM materias WHERE LOWER(TRIM(nombre)) = LOWER(TRIM(?)) AND id <> ?",
    [nombre, id],
  );
  if (repetidas.length > 0) {
    return res.status(409).send("Ya existe otra materia con ese nombre");
  }

  await db.execute("UPDATE materias SET nombre = ? WHERE id = ?", [nombre.trim(), id]);
  res.send({ id, nombre: nombre.trim() });
});

// DELETE de materia, protegido si tiene calificaciones cargadas
router.delete("/:id", validarId, verificarValidaciones, async (req, res) => {
  const id = Number(req.params.id);

  const [existentes] = await db.execute("SELECT id, nombre FROM materias WHERE id = ?", [id]);
  if (existentes.length === 0) {
    return res.status(404).send("Materia no encontrada");
  }

  const [usos] = await db.execute("SELECT id FROM calificaciones WHERE materia_id = ?", [id]);
  if (usos.length > 0) {
    return res.status(409).send("No se puede eliminar: hay calificaciones para esta materia");
  }

  await db.execute("DELETE FROM materias WHERE id = ?", [id]);
  res.send(existentes[0]);
});

// GET calificaciones de una materia
router.get("/:id/calificaciones", validarId, verificarValidaciones, async (req, res) => {
  const id = Number(req.params.id);

  const [materias] = await db.execute("SELECT id FROM materias WHERE id = ?", [id]);
  if (materias.length === 0) {
    return res.status(404).send("Materia no encontrada");
  }

  const [calificaciones] = await db.execute(
    "SELECT c.id, c.alumno, c.materia_id, m.nombre AS materia, c.nota1, c.nota2, c.nota3 " +
      "FROM calificaciones c JOIN materias m ON c.materia_id = m.id " +
      "WHERE c.materia_id = ?",
    [id],
  );
  res.send(calificaciones.map(representarCalificacion));
});

export default router;