import express from "express";
import { db } from "./db.js";
import {
  validarFiltrosTareas,
  validarId,
  validarTarea,
  verificarValidaciones,
} from "./validaciones.js";

const router = express.Router();

// listar tareas
router.get("/", validarFiltrosTareas, verificarValidaciones, async (req, res) => {
  try {
    const filtros = [];
    const parametros = [];

    const { estado, limit, offset } = req.query;

    if (estado === "completadas") {
      filtros.push("estado = 1");
    } else if (estado === "pendientes") {
      filtros.push("estado = 0");
    }

    let sql = "SELECT id, nombre, estado FROM ejercicio2";

    if (filtros.length > 0) {
      sql += " WHERE " + filtros.join(" AND ");
    }

    sql += " ORDER BY id ASC";

    if (limit !== undefined) {
      sql += " LIMIT ?";
      parametros.push(Number(limit));

      if (offset !== undefined) {
        sql += " OFFSET ?";
        parametros.push(Number(offset));
      }
    }

    const [filas] = await db.execute(sql, parametros);
    const tareas = filas.map((t) => ({
      id: t.id,
      nombre: t.nombre,
      estado: Boolean(t.estado),
    }));

    res.send(tareas);
  } catch (error) {
    console.error(error.message);
    res.status(500).send({ error: error.message });
  }
});

// obtener una tarea por id
router.get("/:id", validarId, verificarValidaciones, async (req, res) => {
  try {
    const id = Number(req.params.id);

    const sql = "SELECT id, nombre, estado FROM ejercicio2 WHERE id = ?";
    const [tareas] = await db.execute(sql, [id]);

    if (tareas.length === 0) {
      return res.status(404).send("Tarea no encontrada");
    }

    res.send({
      id: tareas[0].id,
      nombre: tareas[0].nombre,
      estado: Boolean(tareas[0].estado),
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send({ error: error.message });
  }
});

// crear tarea
router.post("/", validarTarea, verificarValidaciones, async (req, res) => {
  try {
    // sacar espacios de sobra
    const nombre = req.body.nombre.trim().replace(/\s+/g, " ");
    const estado = req.body.estado === true ? 1 : 0;

    // revisar si ya existe una tarea con ese nombre
    const [existente] = await db.execute(
      "SELECT id FROM ejercicio2 WHERE LOWER(nombre) = LOWER(?)",
      [nombre],
    );

    if (existente.length > 0) {
      return res.status(409).send("Ya existe una tarea con ese nombre");
    }

    const [result] = await db.execute(
      "INSERT INTO ejercicio2 (nombre, estado) VALUES (?, ?)",
      [nombre, estado],
    );

    res.status(201).send({
      id: result.insertId,
      nombre,
      estado: Boolean(estado),
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send({ error: error.message });
  }
});

// modificar tarea
router.put("/:id", validarId, validarTarea, verificarValidaciones, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const nombre = req.body.nombre.trim().replace(/\s+/g, " ");
    const estado = req.body.estado === true ? 1 : 0;

    // revisar si la tarea existe
    const [existente] = await db.execute("SELECT id FROM ejercicio2 WHERE id = ?", [id]);
    if (existente.length === 0) {
      return res.status(404).send("Tarea no encontrada");
    }

    // revisar que otra tarea no tenga el mismo nombre
    const [duplicados] = await db.execute(
      "SELECT id FROM ejercicio2 WHERE LOWER(nombre) = LOWER(?) AND id <> ?",
      [nombre, id],
    );

    if (duplicados.length > 0) {
      return res.status(409).send("Ya existe otra tarea con ese nombre");
    }

    await db.execute("UPDATE ejercicio2 SET nombre = ?, estado = ? WHERE id = ?", [
      nombre,
      estado,
      id,
    ]);

    res.send({
      id,
      nombre,
      estado: Boolean(estado),
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send({ error: error.message });
  }
});

// eliminar tarea
router.delete("/:id", validarId, verificarValidaciones, async (req, res) => {
  try {
    const id = Number(req.params.id);

    const [result] = await db.execute("DELETE FROM ejercicio2 WHERE id = ?", [id]);

    if (result.affectedRows === 0) {
      return res.status(404).send("Tarea no encontrada");
    }

    res.status(204).send();
  } catch (error) {
    console.error(error.message);
    res.status(500).send({ error: error.message });
  }
});

export default router;
