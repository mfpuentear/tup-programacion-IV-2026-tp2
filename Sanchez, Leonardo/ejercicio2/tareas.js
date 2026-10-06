import express from "express"
import { db } from "./db.js"
import { body, param, query, validationResult } from "express-validator"

const router = express.Router()

// Valida los campos que se reciben al crear o reemplazar una tarea.
const validarTarea = [
  body("nombre")
    .isString()
    .withMessage("El nombre debe ser texto")
    .bail() // Detiene la validación si falla la validación anterior
    .custom((nombre) => nombre.trim().length > 0)
    .withMessage("El nombre es obligatorio")
    .bail()
    .isLength({ max: 255 })
    .withMessage("El nombre no puede superar 255 caracteres"),
  body("estado")
    .custom((estado) => typeof estado === "boolean")
    .withMessage("El estado debe ser un booleano"),
]

const validarId = [
  param("id")
    .isInt({ min: 1 })
    .withMessage("El id debe ser un entero positivo")
    .toInt(),
]

// El filtro recibe palabras en la URL y solo acepta estos dos estados.
const validarFiltroEstado = [
  query("estado")
    .optional()
    .isIn(["completadas", "pendientes"])
    .withMessage("El estado debe ser completadas o pendientes"),
]

const responderErroresValidacion = (req, res, next) => {
  const errores = validationResult(req)
  if (!errores.isEmpty()) {
    return res.status(400).json({ errores: errores.array() })
  }
  // Si no hay errores, Express continúa con la siguiente función de la ruta.
  next()
}

// Busca una tarea con el mismo nombre. En una edición, ignora el id que se está modificando.
const nombreDuplicado = async (nombre, excluirId = null) => {
  const sql =
    excluirId === null
      ? "SELECT id FROM tareas WHERE nombre = ?"
      : "SELECT id FROM tareas WHERE nombre = ? AND id <> ?"
  const valores = excluirId === null ? [nombre] : [nombre, excluirId]
  const [tareas] = await db.execute(sql, valores)
  // Una o más filas encontradas significan que el nombre ya está ocupado.
  return tareas.length > 0
}

const responderError = (res, error) => {
  console.error(error)
  // La restricción UNIQUE de la base también puede detectar duplicados concurrentes.
  if (error.code === "ER_DUP_ENTRY") {
    return res.status(409).json({ error: "El nombre de la tarea ya existe" })
  }
  return res.status(500).json({ error: "Error interno del servidor" })
}

router.get(
  "/",
  validarFiltroEstado,
  responderErroresValidacion,
  async (req, res) => {
    try {
      const { estado } = req.query

      // Convierte el filtro de texto de la URL al booleano guardado en la base.
      const estadoBooleano = estado === "completadas"
      const sql =
        estado === undefined
          ? "SELECT id, nombre, estado FROM tareas"
          : "SELECT id, nombre, estado FROM tareas WHERE estado = ?"
      const valores = estado === undefined ? [] : [estadoBooleano]
      const [tareas] = await db.execute(sql, valores)
      return res.status(200).json(
        tareas.map((tarea) => ({
          ...tarea,
          estado: Boolean(tarea.estado),
        }))
      )
    } catch (error) {
      return responderError(res, error)
    }
  }
)

router.post("/", validarTarea, responderErroresValidacion, async (req, res) => {
  try {
    const { nombre, estado } = req.body

    // Se revisa antes de insertar para responder con un error claro si ya existe.
    if (await nombreDuplicado(nombre)) {
      return res.status(409).json({ error: "El nombre de la tarea ya existe" })
    }

    const sql = "INSERT INTO tareas (nombre, estado) VALUES (?, ?)"
    const [resultado] = await db.execute(sql, [nombre, estado])

    return res.status(201).json({
      id: resultado.insertId,
      nombre,
      estado,
    })
  } catch (error) {
    return responderError(res, error)
  }
})

router.put(
  "/:id",
  validarId,
  validarTarea,
  responderErroresValidacion,
  async (req, res) => {
    try {
      const { id } = req.params
      const { nombre, estado } = req.body

      const [existentes] = await db.execute(
        "SELECT id FROM tareas WHERE id = ?",
        [id]
      )
      if (existentes.length === 0) {
        return res.status(404).json({ error: "Tarea no encontrada" })
      }

      // Se pasa el id actual para que la búsqueda solo compare con las otras tareas.
      if (await nombreDuplicado(nombre, id)) {
        return res
          .status(409)
          .json({ error: "El nombre de la tarea ya existe" })
      }

      const sql = "UPDATE tareas SET nombre = ?, estado = ? WHERE id = ?"
      await db.execute(sql, [nombre, estado, id])

      return res.status(200).json({
        mensaje: "Tarea actualizada correctamente",
        id,
        nombre,
        estado,
      })
    } catch (error) {
      return responderError(res, error)
    }
  }
)

router.delete(
  "/:id",
  validarId,
  responderErroresValidacion,
  async (req, res) => {
    try {
      const { id } = req.params

      const [resultado] = await db.execute("DELETE FROM tareas WHERE id = ?", [
        id,
      ])

      if (resultado.affectedRows === 0) {
        return res.status(404).json({ error: "Tarea no encontrada" })
      }
      return res.status(200).json({ mensaje: "Tarea eliminada correctamente" })
    } catch (error) {
      return responderError(res, error)
    }
  }
)

export default router
