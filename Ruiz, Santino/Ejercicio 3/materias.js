import express from "express";
import db from "./db.js";
import { validarParamId, validarMateriaBody } from "./validaciones.js";

const router = express.Router();

// GET /materias
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM materias ORDER BY nombre ASC");
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ error: "Error en el servidor", detalle: error.message });
  }
});

// POST /materias
router.post("/", validarMateriaBody, async (req, res) => {
  try {
    const { nombre } = req.body;
    const nombreLimpio = nombre.trim();

    const [existente] = await db.query(
      "SELECT id FROM materias WHERE LOWER(TRIM(nombre)) = LOWER(?)",
      [nombreLimpio]
    );

    if (existente.length > 0) {
      return res.status(400).json({
        error: "Error de validación",
        detalles: [{ campo: "nombre", mensaje: "Ya existe una materia registrada con ese nombre" }],
      });
    }

    const [result] = await db.query("INSERT INTO materias (nombre) VALUES (?)", [nombreLimpio]);

    res.status(201).json({ id: result.insertId, nombre: nombreLimpio });
  } catch (error) {
    res.status(500).json({ error: "Error al crear la materia", detalle: error.message });
  }
});

export default router;