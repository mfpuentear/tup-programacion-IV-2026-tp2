import express from "express";
import { db } from "./db.js";
import {
  validarId,
  validarTarea,
  validarFiltroEstado,
  verificarValidaciones,
} from "./validaciones.js";

const router = express.Router();

// GET para listar tareas, con filtro opcional por estado
router.get(
  "/",
  validarFiltroEstado,
  verificarValidaciones,
  async (req, res) => {
    const { completada } = req.query;

    let sql = "SELECT * FROM tareas";
    const parametros = [];

    if (completada !== undefined) {
      sql += " WHERE completada = ?";
      parametros.push(completada === "true" ? 1 : 0);
    }

    sql += " ORDER BY id ASC";

    const [tareas] = await db.execute(sql, parametros);
    res.send(tareas);
  },
);

// GET para obtener una tarea por id
router.get("/:id", validarId, verificarValidaciones, async (req, res) => {
  const id = Number(req.params.id);

  const [tareas] = await db.execute("SELECT * FROM tareas WHERE id = ?", [id]);

  if (tareas.length === 0) {
    return res.status(404).send("Tarea no encontrada");
  }

  res.send(tareas[0]);
});

// POST para crear una tarea
router.post("/", validarTarea, verificarValidaciones, async (req, res) => {
  // Normalizo el nombre: sin espacios extra y en minúsculas, para
  // comparar/guardar de forma consistente y evitar duplicados "Lavar" vs "lavar "
  const nombreNormalizado = req.body.nombre.trim().toLowerCase();
  const completada = req.body.completada;

  // Verifico si ya existe una tarea con ese nombre (normalizado)
  const [existentes] = await db.execute(
    "SELECT id FROM tareas WHERE LOWER(TRIM(nombre)) = ?",
    [nombreNormalizado],
  );

  if (existentes.length > 0) {
    return res.status(409).send("Ya existe una tarea con ese nombre");
  }

  const [result] = await db.execute(
    "INSERT INTO tareas (nombre, completada) VALUES (?, ?)",
    [req.body.nombre.trim(), completada],
  );

  res.status(201).send({
    id: result.insertId,
    nombre: req.body.nombre.trim(),
    completada,
  });
});

// PUT para actualizar una tarea
router.put(
  "/:id",
  validarId,
  validarTarea,
  verificarValidaciones,
  async (req, res) => {
    const id = Number(req.params.id);
    const nombreNormalizado = req.body.nombre.trim().toLowerCase();
    const completada = req.body.completada;

    // Verifico que el nuevo nombre no choque con el de OTRA tarea existente
    const [existentes] = await db.execute(
      "SELECT id FROM tareas WHERE LOWER(TRIM(nombre)) = ? AND id != ?",
      [nombreNormalizado, id],
    );

    if (existentes.length > 0) {
      return res.status(409).send("Ya existe otra tarea con ese nombre");
    }

    const [result] = await db.execute(
      "UPDATE tareas SET nombre = ?, completada = ? WHERE id = ?",
      [req.body.nombre.trim(), completada, id],
    );

    if (result.affectedRows === 0) {
      return res.status(404).send("Tarea no encontrada");
    }

    res.send({ id, nombre: req.body.nombre.trim(), completada });
  },
);

// DELETE para eliminar una tarea
router.delete("/:id", validarId, verificarValidaciones, async (req, res) => {
  const id = Number(req.params.id);

  const [result] = await db.execute("DELETE FROM tareas WHERE id = ?", [id]);

  if (result.affectedRows === 0) {
    return res.status(404).send("Tarea no encontrada");
  }

  res.send({ mensaje: "Tarea eliminada" });
});

export default router;
