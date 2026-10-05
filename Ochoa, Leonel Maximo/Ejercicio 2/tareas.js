import express from "express";
import { db } from "./db.js";
import {
  validarId,
  validarFiltroEstado,
  validarTarea,
  validarTareaPut,
  verificarValidaciones,
} from "./validaciones.js";

const router = express.Router();

function parsearBooleano(valor) {
  return valor === true || valor === 1 || valor === "true" || valor === "1";
}

function mapear(fila) {
  return {
    id: fila.id,
    nombre: fila.nombre,
    completada: Boolean(fila.completada),
  };
}

async function existeNombre(nombre, idActual = null) {
  const sql =
    idActual === null
      ? "SELECT id FROM tareas WHERE LOWER(nombre) = LOWER(?)"
      : "SELECT id FROM tareas WHERE LOWER(nombre) = LOWER(?) AND id <> ?";
  const params = idActual === null ? [nombre] : [nombre, idActual];
  const [filas] = await db.execute(sql, params);
  return filas.length > 0;
}

// GET listado, filtro opcional por estado
router.get("/", validarFiltroEstado, verificarValidaciones, async (req, res) => {
  const filtros = [];
  const parametros = [];

  if (req.query.estado === "completada") {
    filtros.push("completada = ?");
    parametros.push(1);
  }

  if (req.query.estado === "pendiente") {
    filtros.push("completada = ?");
    parametros.push(0);
  }

  let sql = "SELECT id, nombre, completada FROM tareas";
  if (filtros.length > 0) {
    sql += " WHERE " + filtros.join(" AND ");
  }

  const [filas] = await db.execute(sql, parametros);
  res.send(filas.map(mapear));
});

// GET detalle
router.get("/:id", validarId, verificarValidaciones, async (req, res) => {
  const id = Number(req.params.id);
  const [filas] = await db.execute(
    "SELECT id, nombre, completada FROM tareas WHERE id = ?",
    [id],
  );

  if (filas.length === 0) {
    return res.status(404).send("Tarea no encontrada");
  }

  res.send(mapear(filas[0]));
});

// POST crear
router.post("/", validarTarea, verificarValidaciones, async (req, res) => {
  const nombre = req.body.nombre.trim();
  const completada =
    req.body.completada === undefined ? false : parsearBooleano(req.body.completada);

  if (await existeNombre(nombre)) {
    return res.status(409).json({ mensaje: "Ya existe una tarea con ese nombre" });
  }

  const [result] = await db.execute(
    "INSERT INTO tareas (nombre, completada) VALUES (?, ?)",
    [nombre, completada ? 1 : 0],
  );

  res.status(201).send({ id: result.insertId, nombre, completada });
});

// PUT reemplazar
router.put("/:id", validarId, validarTareaPut, verificarValidaciones, async (req, res) => {
  const id = Number(req.params.id);
  const [existentes] = await db.execute("SELECT id FROM tareas WHERE id = ?", [id]);

  if (existentes.length === 0) {
    return res.status(404).send("Tarea no encontrada");
  }

  const nombre = req.body.nombre.trim();
  const completada = parsearBooleano(req.body.completada);

  if (await existeNombre(nombre, id)) {
    return res.status(409).json({ mensaje: "Ya existe una tarea con ese nombre" });
  }

  await db.execute("UPDATE tareas SET nombre = ?, completada = ? WHERE id = ?", [
    nombre,
    completada ? 1 : 0,
    id,
  ]);

  res.send({ id, nombre, completada });
});

// DELETE
router.delete("/:id", validarId, verificarValidaciones, async (req, res) => {
  const id = Number(req.params.id);
  const [filas] = await db.execute(
    "SELECT id, nombre, completada FROM tareas WHERE id = ?",
    [id],
  );

  if (filas.length === 0) {
    return res.status(404).send("Tarea no encontrada");
  }

  await db.execute("DELETE FROM tareas WHERE id = ?", [id]);
  res.send(mapear(filas[0]));
});

export default router;
