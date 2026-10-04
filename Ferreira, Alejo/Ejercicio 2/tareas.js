import express from "express";
import { db } from "./db.js";
import {
  validarCrearTarea,
  validarFiltros,
  validarId,
  validarModificarTarea,
  verificarValidaciones,
} from "./validaciones.js";

const router = express.Router();

// MySQL guarda los BOOLEAN como 0/1: los convertimos a true/false
function formatear(tarea) {
  return { ...tarea, completada: Boolean(tarea.completada) };
}

// GET para entregar listado de tareas (filtro opcional por estado)
router.get("/", validarFiltros, verificarValidaciones, async (req, res) => {
  const { estado } = req.query;

  let sql = "SELECT * FROM tareas";
  const parametros = [];

  if (estado !== undefined) {
    sql += " WHERE completada = ?";
    parametros.push(estado === "completadas" ? 1 : 0);
  }

  const [tareas] = await db.execute(sql, parametros);
  res.send(tareas.map(formatear));
});

// GET para entregar una tarea
router.get("/:id", validarId, verificarValidaciones, async (req, res) => {
  const id = Number(req.params.id);

  const [tareas] = await db.execute("SELECT * FROM tareas WHERE id = ?", [id]);

  if (tareas.length === 0) {
    return res.status(404).send({ mensaje: "Tarea no encontrada" });
  }

  res.send(formatear(tareas[0]));
});

// POST para crear tarea
router.post("/", validarCrearTarea, verificarValidaciones, async (req, res) => {
  const { nombre } = req.body;
  const completada = req.body.completada ?? false;

  try {
    const [result] = await db.execute(
      "INSERT INTO tareas (nombre, completada) VALUES (?, ?)",
      [nombre, completada ? 1 : 0],
    );
    res.status(201).send({ id: result.insertId, nombre, completada });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).send({ mensaje: "Ya existe una tarea con ese nombre" });
    }
    throw error;
  }
});

// PUT para modificar tarea
router.put(
  "/:id",
  validarId,
  validarModificarTarea,
  verificarValidaciones,
  async (req, res) => {
    const id = Number(req.params.id);
    const { nombre, completada } = req.body;

    try {
      const [result] = await db.execute(
        "UPDATE tareas SET nombre = ?, completada = ? WHERE id = ?",
        [nombre, completada ? 1 : 0, id],
      );

      if (result.affectedRows === 0) {
        return res.status(404).send({ mensaje: "Tarea no encontrada" });
      }

      res.send({ id, nombre, completada });
    } catch (error) {
      if (error.code === "ER_DUP_ENTRY") {
        return res.status(409).send({ mensaje: "Ya existe una tarea con ese nombre" });
      }
      throw error;
    }
  },
);

// DELETE para eliminar tarea
router.delete("/:id", validarId, verificarValidaciones, async (req, res) => {
  const id = Number(req.params.id);

  const [result] = await db.execute("DELETE FROM tareas WHERE id = ?", [id]);

  if (result.affectedRows === 0) {
    return res.status(404).send({ mensaje: "Tarea no encontrada" });
  }

  res.status(204).send();
});

export default router;