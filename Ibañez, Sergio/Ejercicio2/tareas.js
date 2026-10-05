import express from "express";
import { db } from "./db.js";
import {
  validarFiltrosTareas,
  validarId,
  validarTareaNueva,
  validarTareaCompleta,
  validarTareaParcial,
  verificarValidaciones,
} from "./validaciones.js";

const router = express.Router();

// Criterio de comparacion de nombres: sin mayusculas y sin espacios extra
function nombreProlijo(nombre) {
  return nombre.trim().toLowerCase();
}

// Arma la respuesta con el estado en texto para facilitar la lectura
function representarTarea(tarea) {
  return {
    id: tarea.id,
    nombre: tarea.nombre,
    completada: Boolean(tarea.completada),
    estado: tarea.completada ? "completada" : "pendiente",
  };
}

// GET para entregar listado de tareas con filtro opcional por estado
router.get("/", validarFiltrosTareas, verificarValidaciones, async (req, res) => {
  const { estado } = req.query;
  let sql = "SELECT id, nombre, completada FROM tareas";
  if (estado === "completada") {
    sql += " WHERE completada = 1";
  }
  if (estado === "pendiente") {
    sql += " WHERE completada = 0";
  }
  const [tareas] = await db.execute(sql);
  res.send(tareas.map(representarTarea));
});

// GET para entregar detalle de una tarea
router.get("/:id", validarId, verificarValidaciones, async (req, res) => {
  const id = Number(req.params.id);
  const [tareas] = await db.execute(
    "SELECT id, nombre, completada FROM tareas WHERE id = ?",
    [id],
  );
  if (tareas.length === 0) {
    return res.status(404).send("Tarea no encontrada");
  }
  res.send(representarTarea(tareas[0]));
});

// POST para crear una tarea
router.post("/", validarTareaNueva, verificarValidaciones, async (req, res) => {
  const { nombre, completada } = req.body;
  const estadoInicial = completada === undefined ? false : completada;

  // Regla de unicidad con el criterio de comparacion
  const [repetidas] = await db.execute(
    "SELECT id FROM tareas WHERE LOWER(TRIM(nombre)) = ?",
    [nombreProlijo(nombre)],
  );
  if (repetidas.length > 0) {
    return res.status(409).send("Ya existe una tarea con ese nombre");
  }

  const [result] = await db.execute(
    "INSERT INTO tareas (nombre, completada) VALUES (?,?)",
    [nombre.trim(), estadoInicial],
  );

  res.status(201).send({
    id: result.insertId,
    nombre: nombre.trim(),
    completada: estadoInicial,
    estado: estadoInicial ? "completada" : "pendiente",
  });
});

// PUT para reemplazo completo de una tarea
router.put(
  "/:id",
  validarId,
  validarTareaCompleta,
  verificarValidaciones,
  async (req, res) => {
    const id = Number(req.params.id);

    const [existentes] = await db.execute(
      "SELECT id FROM tareas WHERE id = ?",
      [id],
    );
    if (existentes.length === 0) {
      return res.status(404).send("Tarea no encontrada");
    }

    const { nombre, completada } = req.body;

    // Unicidad excluyendo la propia tarea
    const [repetidas] = await db.execute(
      "SELECT id FROM tareas WHERE LOWER(TRIM(nombre)) = ? AND id <> ?",
      [nombreProlijo(nombre), id],
    );
    if (repetidas.length > 0) {
      return res.status(409).send("Ya existe otra tarea con ese nombre");
    }

    await db.execute(
      "UPDATE tareas SET nombre = ?, completada = ? WHERE id = ?",
      [nombre.trim(), completada, id],
    );

    res.send({
      id,
      nombre: nombre.trim(),
      completada,
      estado: completada ? "completada" : "pendiente",
    });
  },
);

// PATCH para modificacion parcial, por ejemplo marcar completada
router.patch(
  "/:id",
  validarId,
  validarTareaParcial,
  verificarValidaciones,
  async (req, res) => {
    const id = Number(req.params.id);

    const [existentes] = await db.execute(
      "SELECT id, nombre, completada FROM tareas WHERE id = ?",
      [id],
    );
    if (existentes.length === 0) {
      return res.status(404).send("Tarea no encontrada");
    }

    const { nombre, completada } = req.body;

    if (nombre !== undefined) {
      const [repetidas] = await db.execute(
        "SELECT id FROM tareas WHERE LOWER(TRIM(nombre)) = ? AND id <> ?",
        [nombreProlijo(nombre), id],
      );
      if (repetidas.length > 0) {
        return res.status(409).send("Ya existe otra tarea con ese nombre");
      }
    }

    const nuevoNombre =
      nombre === undefined ? existentes[0].nombre : nombre.trim();
    const nuevaCompletada =
      completada === undefined ? Boolean(existentes[0].completada) : completada;

    await db.execute(
      "UPDATE tareas SET nombre = ?, completada = ? WHERE id = ?",
      [nuevoNombre, nuevaCompletada, id],
    );

    res.send({
      id,
      nombre: nuevoNombre,
      completada: nuevaCompletada,
      estado: nuevaCompletada ? "completada" : "pendiente",
    });
  },
);

// DELETE para quitar una tarea
router.delete("/:id", validarId, verificarValidaciones, async (req, res) => {
  const id = Number(req.params.id);

  const [existentes] = await db.execute(
    "SELECT id, nombre, completada FROM tareas WHERE id = ?",
    [id],
  );
  if (existentes.length === 0) {
    return res.status(404).send("Tarea no encontrada");
  }

  await db.execute("DELETE FROM tareas WHERE id = ?", [id]);

  res.send(representarTarea(existentes[0]));
});

export default router;