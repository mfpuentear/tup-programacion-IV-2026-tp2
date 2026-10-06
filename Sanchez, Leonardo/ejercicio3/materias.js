import express from "express"
import { db } from "./db.js"
import { body, param, validationResult } from "express-validator"

const router = express.Router()

const validarNombreMateria = [
  body("nombre")
    .isString()
    .withMessage("El nombre de la materia debe ser texto")
    .bail()
    .custom((nombre) => typeof nombre === "string" && nombre.trim().length > 0)
    .withMessage("El nombre de la materia es obligatorio")
    .bail()
    .trim()
    .isLength({ max: 255 })
    .withMessage("El nombre de la materia no puede superar 255 caracteres"),
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
  return res.status(500).json({ error: "Error interno del servidor" })
}

router.get("/", async (req, res) => {
  try {
    const [materias] = await db.execute(
      "SELECT id, nombre FROM materias ORDER BY id ASC"
    )
    return res.status(200).json(materias)
  } catch (error) {
    return responderError(res, error)
  }
})

router.get("/:id", validarId, responderErroresValidacion, async (req, res) => {
  try {
    const { id } = req.params
    const [materias] = await db.execute(
      "SELECT id, nombre FROM materias WHERE id = ?",
      [id]
    )

    if (materias.length === 0) {
      return res.status(404).json({ error: "Materia no encontrada" })
    }

    return res.status(200).json(materias[0])
  } catch (error) {
    return responderError(res, error)
  }
})

router.post(
  "/",
  validarNombreMateria,
  responderErroresValidacion,
  async (req, res) => {
    try {
      const { nombre } = req.body
      const sql = "INSERT INTO materias (nombre) VALUES (?)"
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
  validarNombreMateria,
  responderErroresValidacion,
  async (req, res) => {
    try {
      const { id } = req.params
      const { nombre } = req.body

      const [materias] = await db.execute(
        "SELECT id FROM materias WHERE id = ?",
        [id]
      )
      if (materias.length === 0) {
        return res.status(404).json({ error: "Materia no encontrada" })
      }

      await db.execute("UPDATE materias SET nombre = ? WHERE id = ?", [
        nombre.trim(),
        id,
      ])

      return res.status(200).json({
        mensaje: "Materia actualizada correctamente",
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
      const [resultado] = await db.execute(
        "DELETE FROM materias WHERE id = ?",
        [id]
      )

      if (resultado.affectedRows === 0) {
        return res.status(404).json({ error: "Materia no encontrada" })
      }

      return res
        .status(200)
        .json({ mensaje: "Materia eliminada correctamente" })
    } catch (error) {
      return responderError(res, error)
    }
  }
)

export default router
