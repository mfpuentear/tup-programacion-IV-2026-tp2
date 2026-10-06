import express from "express";
import { db } from "./db.js";
import {
  validarFiltrosTareas,
  validarId,
  validarCrearTarea,
  validarModificarTarea,
  verificarValidaciones,
} from "./validaciones.js";

const router = express.Router();

// MySQL guarda los BOOLEAN como 0 y 1, se convierten a true y false
function convertirTarea(tarea) {
  return { ...tarea, completada: Boolean(tarea.completada) };
}

// GET para entregar listado de tareas
router.get("/", validarFiltrosTareas, verificarValidaciones, async (req, res) => {
  const filtros = [];
  const parametros = [];

  const { estado } = req.query;

  if (estado === "completada") {
    filtros.push("completada = ?");
    parametros.push(true);
  }

  if (estado === "pendiente") {
    filtros.push("completada = ?");
    parametros.push(false);
  }

  let sql = "SELECT * FROM tareas";

  if (filtros.length > 0) {
    sql += " WHERE " + filtros.join(" AND ");
  }

  const [tareas] = await db.execute(sql, parametros);
  res.send(tareas.map(convertirTarea));
});

// GET para entregar detalle de tarea
router.get("/:id", validarId, verificarValidaciones, async (req, res) => {
  // Obtengo id
  const id = Number(req.params.id);

  const [tareas] = await db.execute("SELECT * FROM tareas WHERE id=?", [id]);

  if (tareas.length === 0) {
    return res.status(404).send("Tarea no encontrada");
  }

  res.send(convertirTarea(tareas[0]));
});

// POST para crear tarea
router.post("/", validarCrearTarea, verificarValidaciones, async (req, res) => {
  // Obtengo body
  const { nombre, completada = false } = req.body;

  const [result] = await db.execute(
    "INSERT INTO tareas (nombre, completada) VALUES (?,?)",
    [nombre, completada],
  );

  res.status(201).send({ id: result.insertId, nombre, completada });
});

// PUT para modificar tarea a partir de un id
router.put(
  "/:id",
  validarId,
  validarModificarTarea,
  verificarValidaciones,
  async (req, res) => {
    // Obtengo id
    const id = Number(req.params.id);

    // Verificar que este presente la tarea
    const [tareas] = await db.execute("SELECT * FROM tareas WHERE id=?", [id]);

    if (tareas.length === 0) {
      return res.status(404).send("Tarea no encontrada");
    }

    const { nombre, completada } = req.body;

    await db.execute("UPDATE tareas SET nombre=?, completada=? WHERE id=?", [
      nombre,
      completada,
      id,
    ]);

    // Responder con tarea modificada
    res.send({ id, nombre, completada });
  },
);

// DELETE para quitar una tarea a partir de un id
router.delete("/:id", validarId, verificarValidaciones, async (req, res) => {
  // Obtengo id
  const id = Number(req.params.id);

  // Verificar que este presente la tarea
  const [tareas] = await db.execute("SELECT * FROM tareas WHERE id=?", [id]);

  if (tareas.length === 0) {
    return res.status(404).send("Tarea no encontrada");
  }

  await db.execute("DELETE FROM tareas WHERE id=?", [id]);

  // Retornar tarea quitada
  res.send(convertirTarea(tareas[0]));
});

export default router;