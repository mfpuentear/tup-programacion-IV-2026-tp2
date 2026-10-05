import express from "express";
import { db } from "./db.js";
import { validarTarea, validarId, validarEstado, verificarValidaciones } from "./validaciones.js";

const router = express.Router();

// GET listar todas las tareaas o filtrar por estado
router.get("/", validarEstado, verificarValidaciones, async (req, res) => {
  const { completada } = req.query;
  let sql = "SELECT * FROM tareas";
  let params = [];

  if (completada !== undefined) {
    sql += " WHERE completada=?";
    params.push(completada === "true");
  }

  const [rows] = await db.execute(sql, params);
  res.send(rows);
});

// GET detalle de tarea
router.get("/:id", validarId, verificarValidaciones, async (req, res) => {
  const id = Number(req.params.id);
  const [rows] = await db.execute("SELECT * FROM tareas WHERE id=?", [id]);

  if (rows.length === 0) {
    return res.status(404).send("Tarea no encontrada");
  }
  res.send(rows[0]);
});

// POST crear tarea
router.post("/", validarTarea, verificarValidaciones, async (req, res) => {
  let { nombre, completada } = req.body;
  nombre = nombre.trim(); // criterio de unicidad

  // Verificar unicidad
  const [existe] = await db.execute("SELECT * FROM tareas WHERE LOWER(nombre)=?", [nombre]);
  if (existe.length > 0) {
    return res.status(400).json({ mensaje: "Ya existe una tarea con ese nombre" });
  }

  const [result] = await db.execute(
    "INSERT INTO tareas (nombre, completada) VALUES (?,?)",
    [nombre, completada]
  );

  res.status(201).send({ id: result.insertId, nombre, completada });
});

// PUT modificar tarea
router.put("/:id", [validarId, ...validarTarea], verificarValidaciones, async (req, res) => {
  const id = Number(req.params.id);
  let { nombre, completada } = req.body;
  nombre = nombre.trim();

  // Verificar unicidad (excepto la misma tarea)
  const [existe] = await db.execute("SELECT * FROM tareas WHERE nombre=? AND id<>?", [nombre, id]);
  if (existe.length > 0) {
    return res.status(400).json({ mensaje: "Ya existe otra tarea con ese nombre" });
  }

  const [result] = await db.execute(
    "UPDATE tareas SET nombre=?, completada=? WHERE id=?",
    [nombre, completada, id]
  );

  if (result.affectedRows === 0) {
    return res.status(404).send("Tarea no encontrada");
  }

  res.send({ id, nombre, completada });
});

// DELETE eliminar tarea
router.delete("/:id", validarId, verificarValidaciones, async (req, res) => {
  const id = Number(req.params.id);
  const [result] = await db.execute("DELETE FROM tareas WHERE id=?", [id]);

  if (result.affectedRows === 0) {
    return res.status(404).send("Tarea no encontrada");
  }

  res.send({ mensaje: "Tarea eliminada", id });
});

export default router;
