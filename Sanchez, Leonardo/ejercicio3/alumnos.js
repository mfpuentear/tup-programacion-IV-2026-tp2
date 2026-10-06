import express from "express"
import { db } from "./db.js"
import { body, param, validationResult } from "express-validator"

const router = express.Router()

const validarNombreAlumno = [
  body("nombre")
    .isString()
    .withMessage("El nombre del alumno debe ser texto")
    .bail()
    .custom((nombre) => typeof nombre === "string" && nombre.trim().length > 0)
    .withMessage("El nombre del alumno es obligatorio")
    .bail()
    .trim()
    .isLength({ max: 255 })
    .withMessage("El nombre del alumno no puede superar 255 caracteres"),
]

const validarId = [
  param("id")
    .isInt({ min: 1 })
    .withMessage("El id debe ser un entero positivo")
    .toInt(),
]

const responderErroresValidacion = (req, res, next) => {
  const errores = validationResult(req)
  if (!errores.isEmpty()) {
    return res.status(400).json({ errores: errores.array() })
  }
  next()
}

const responderError = (res, error) => {
  console.error(error)
  if (error.code === "ER_DUP_ENTRY") {
    return res.status(409).json({ error: "Ya existe un alumno con ese nombre" })
  }
  return res.status(500).json({ error: "Error interno del servidor" })
}

router.get("/", async (req, res) => {
  try {
    const [alumnos] = await db.execute(
      "SELECT id, nombre FROM alumnos ORDER BY id ASC"
    )
    return res.status(200).json(alumnos)
  } catch (error) {
    return responderError(res, error)
  }
})

router.get("/:id", validarId, responderErroresValidacion, async (req, res) => {
  try {
    const { id } = req.params
    const [alumnos] = await db.execute(
      "SELECT id, nombre FROM alumnos WHERE id = ?",
      [id]
    )

    if (alumnos.length === 0) {
      return res.status(404).json({ error: "Alumno no encontrado" })
    }

    return res.status(200).json(alumnos[0])
  } catch (error) {
    return responderError(res, error)
  }
})

router.post(
  "/",
  validarNombreAlumno,
  responderErroresValidacion,
  async (req, res) => {
    try {
      const { nombre } = req.body
      const sql = "INSERT INTO alumnos (nombre) VALUES (?)"
      const [resultado] = await db.execute(sql, [nombre.trim()])

      return res.status(201).json({
        id: resultado.insertId,
        nombre: nombre.trim(),
      })
    } catch (error) {
      return responderError(res, error)
    }
  }
)

router.put(
  "/:id",
  validarId,
  validarNombreAlumno,
  responderErroresValidacion,
  async (req, res) => {
    try {
      const { id } = req.params
      const { nombre } = req.body

      const [alumnos] = await db.execute(
        "SELECT id FROM alumnos WHERE id = ?",
        [id]
      )
      if (alumnos.length === 0) {
        return res.status(404).json({ error: "Alumno no encontrado" })
      }

      await db.execute("UPDATE alumnos SET nombre = ? WHERE id = ?", [
        nombre.trim(),
        id,
      ])

      return res.status(200).json({
        mensaje: "Alumno actualizado correctamente",
        id,
        nombre: nombre.trim(),
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
      const [resultado] = await db.execute("DELETE FROM alumnos WHERE id = ?", [
        id,
      ])

      if (resultado.affectedRows === 0) {
        return res.status(404).json({ error: "Alumno no encontrado" })
      }

      return res.status(200).json({ mensaje: "Alumno eliminado correctamente" })
    } catch (error) {
      return responderError(res, error)
    }
  }
)

export default router
