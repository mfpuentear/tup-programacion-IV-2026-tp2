import express from "express";
import { db } from "./db.js";
import { validarMateria, validarId, verificarValidaciones } from "./validaciones.js";

const router = express.Router();

// GET todas las materias
router.get("/", async (req, res) => {
  const [rows] = await db.execute("SELECT * FROM materias");
  res.send(rows);
});

// GET materia por ID
router.get("/:id", validarId, verificarValidaciones, async (req, res) => {
  const id = Number(req.params.id);
  const [rows] = await db.execute("SELECT * FROM materias WHERE id=?", [id]);
  if (rows.length === 0) {
    return res.status(404).send("materia no encontrada");
  }
  res.send(rows[0]);
});

// POST crear materia
router.post("/", validarMateria, verificarValidaciones, async (req, res) => {
  const { nombre } = req.body;

  const [existe] = await db.execute("SELECT * FROM materias WHERE LOWER(nombre)=?", [nombre.toLowerCase()]);
  if (existe.length > 0) {
    return res.status(400).send("ya existe una materia con ese nombre");
  }

  const [result] = await db.execute("INSERT INTO materias (nombre) VALUES (?)", [nombre]);
  res.status(201).send({ id: result.insertId, nombre });
});

// PUT modificar materia
router.put("/:id", [validarId, ...validarMateria], verificarValidaciones, async (req, res) => {
  const id = Number(req.params.id);
  const { nombre } = req.body;

  const [existe] = await db.execute("SELECT * FROM materias WHERE LOWER(nombre)=? AND id<>?", [nombre.toLowerCase(), id]);
  if (existe.length > 0) {
    return res.status(400).send("ya existe otra materia con ese nombre");
  }

  const [result] = await db.execute("UPDATE materias SET nombre=? WHERE id=?", [nombre, id]);
  if (result.affectedRows === 0) {
    return res.status(404).send("materia no encontrada");
  }

  res.send({ id, nombre });
});

// DELETE eliminar materia
router.delete("/:id", validarId, verificarValidaciones, async (req, res) => {
  const id = Number(req.params.id);
  const [result] = await db.execute("DELETE FROM materias WHERE id=?", [id]);
  if (result.affectedRows === 0) {
    return res.status(404).send("materia no encontrada");
  }
  res.send("materia eliminada");
});

export default router;
