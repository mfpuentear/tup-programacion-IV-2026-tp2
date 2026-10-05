import express from "express";
import { db } from "./db.js";
import {
  validarId,
  validarFiltroTareas,
  validarTarea,
  validarEstado,
  verificarValidaciones,
} from "./validaciones.js";

const router = express.Router();

// GET listar tareas (con filtro opcional por estado)
router.get("/", validarFiltroTareas, verificarValidaciones, async (req, res) => {
  const { completada } = req.query;

  let sql = "SELECT * FROM tareas";
  const parametros = [];

  if (completada !== undefined) {
    sql += " WHERE completada = ?";
    parametros.push(completada === "true");
  }

  const [tareas] = await db.execute(sql, parametros);
  res.send(tareas);
});

// GET consultar una tarea puntual
router.get("/:id", validarId, verificarValidaciones, async (req, res) => {
  const id = Number(req.params.id);

  const [tareas] = await db.execute("SELECT * FROM tareas WHERE id = ?", [id]);

  if (tareas.length === 0) {
    return res.status(404).send("Tarea no encontrada");
  }

  res.send(tareas[0]);
});

// POST crear una tarea
router.post("/", validarTarea, verificarValidaciones, async (req, res) => {
  const nombre = req.body.nombre.trim();

  const [result] = await db.execute(
    "INSERT INTO tareas (nombre, completada) VALUES (?, false)",
    [nombre],
  );

  res.status(201).send({ id: result.insertId, nombre, completada: false });
});

// PATCH cambiar el estado de una tarea
router.patch(
  "/:id",
  [...[validarId], ...validarEstado],
  verificarValidaciones,
  async (req, res) => {
    const id = Number(req.params.id);
    const { completada } = req.body;

    const [result] = await db.execute(
      "UPDATE tareas SET completada = ? WHERE id = ?",
      [completada, id],
    );

    if (result.affectedRows === 0) {
      return res.status(404).send("Tarea no encontrada");
    }

    res.send({ id, completada });
  },
);

// DELETE borrar una tarea
router.delete("/:id", validarId, verificarValidaciones, async (req, res) => {
  const id = Number(req.params.id);

  const [result] = await db.execute("DELETE FROM tareas WHERE id = ?", [id]);

  if (result.affectedRows === 0) {
    return res.status(404).send("Tarea no encontrada");
  }

  res.status(204).send();
});

export default router;