import express from "express";
import { db } from "./db.js";
import { validarCrearMateria, verificarValidaciones } from "./validaciones.js";

const router = express.Router();

// GET /materias
router.get("/", async (req, res) => {
  try {
    const [filas] = await db.execute("SELECT * FROM materias ORDER BY nombre ASC");
    res.json(filas);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al listar materias", error: error.message });
  }
});

// POST /materias
router.post("/", validarCrearMateria, verificarValidaciones, async (req, res) => {
  try {
    const { nombre } = req.body;
    const [resultado] = await db.execute("INSERT INTO materias (nombre) VALUES (?)", [nombre]);
    res.status(201).json({ id: resultado.insertId, nombre });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al crear la materia", error: error.message });
  }
});

export default router;