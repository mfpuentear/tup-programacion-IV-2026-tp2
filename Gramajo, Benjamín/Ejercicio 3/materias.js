import express from "express";
import { db } from "./db.js";
import {
  validarId,
  validarMateria,
  verificarValidaciones,
} from "./validaciones.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const [materias] = await db.execute("SELECT * FROM materias ORDER BY id ASC");
  res.send(materias);
});

router.get("/:id", validarId, verificarValidaciones, async (req, res) => {
  const id = Number(req.params.id);
  const [materias] = await db.execute("SELECT * FROM materias WHERE id = ?", [
    id,
  ]);
  if (materias.length === 0) {
    return res.status(404).send("Materia no encontrada");
  }
  res.send(materias[0]);
});

router.post("/", validarMateria, verificarValidaciones, async (req, res) => {
  const nombre = req.body.nombre.trim();
  const [result] = await db.execute(
    "INSERT INTO materias (nombre) VALUES (?)",
    [nombre],
  );
  res.status(201).send({ id: result.insertId, nombre });
});

export default router;
