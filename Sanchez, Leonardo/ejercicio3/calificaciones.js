import express from "express"
import { db } from "./db.js"
import { body, param, validationResult } from "express-validator"

const router = express.Router()

const validarCalificacion = [
  body("alumnoId")
    .isInt({ min: 1 })
    .withMessage("El id del alumno debe ser un entero positivo")
    .toInt(),
  body("materiaId")
    .isInt({ min: 1 })
    .withMessage("El id de la materia debe ser un entero positivo")
    .toInt(),
  body("notas")
    .isArray({ min: 3, max: 3 })
    .withMessage("Se deben informar exactamente tres notas")
    .bail()
    .custom((notas) =>
      notas.every((nota) => typeof nota === "number" && Number.isFinite(nota))
    )
    .withMessage("Cada nota debe ser un número válido")
    .bail()
    .custom((notas) => notas.every((nota) => nota >= 0 && nota <= 10))
    .withMessage("Cada nota debe estar en el rango de 0 a 10"),
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

const alumnoExiste = async (alumnoId) => {
  const [alumnos] = await db.execute("SELECT id FROM alumnos WHERE id = ?", [
    alumnoId,
  ])
  return alumnos.length > 0
}

const materiaExiste = async (materiaId) => {
  const [materias] = await db.execute("SELECT id FROM materias WHERE id = ?", [
    materiaId,
  ])
  return materias.length > 0
}

const registroDuplicado = async (alumnoId, materiaId, excluirId = null) => {
  const sql =
    excluirId === null
      ? "SELECT id FROM calificaciones WHERE alumno_id = ? AND materia_id = ?"
      : "SELECT id FROM calificaciones WHERE alumno_id = ? AND materia_id = ? AND id <> ?"
  const valores =
    excluirId === null
      ? [alumnoId, materiaId]
      : [alumnoId, materiaId, excluirId]
  const [filas] = await db.execute(sql, valores)
  return filas.length > 0
}

const responderError = (res, error) => {
  console.error(error)
  if (error.code === "ER_DUP_ENTRY") {
    return res.status(409).json({
      error: "Ya existe una calificación para ese alumno y materia",
    })
  }
  if (error.code === "ER_NO_REFERENCED_ROW_2") {
    return res
      .status(400)
      .json({ error: "El alumno o la materia referenciada no existe" })
  }
  return res.status(500).json({ error: "Error interno del servidor" })
}

router.get("/", async (req, res) => {
  try {
    const [calificaciones] = await db.execute(`
      SELECT c.id, c.alumno_id AS alumnoId, a.nombre AS alumno, c.materia_id AS materiaId, m.nombre AS materia, c.nota1, c.nota2, c.nota3
      FROM calificaciones c
      INNER JOIN alumnos a ON a.id = c.alumno_id
      INNER JOIN materias m ON m.id = c.materia_id
      ORDER BY c.id ASC
    `)

    return res.status(200).json(
      calificaciones.map((calificacion) => ({
        ...calificacion,
        notas: [calificacion.nota1, calificacion.nota2, calificacion.nota3],
      }))
    )
  } catch (error) {
    return responderError(res, error)
  }
})

router.get("/:id", validarId, responderErroresValidacion, async (req, res) => {
  try {
    const { id } = req.params
    const [calificaciones] = await db.execute(
      `
        SELECT c.id, c.alumno_id AS alumnoId, a.nombre AS alumno, c.materia_id AS materiaId, m.nombre AS materia, c.nota1, c.nota2, c.nota3
        FROM calificaciones c
        INNER JOIN alumnos a ON a.id = c.alumno_id
        INNER JOIN materias m ON m.id = c.materia_id
        WHERE c.id = ?
      `,
      [id]
    )

    if (calificaciones.length === 0) {
      return res.status(404).json({ error: "Calificación no encontrada" })
    }

    const calificacion = calificaciones[0]
    return res.status(200).json({
      ...calificacion,
      notas: [calificacion.nota1, calificacion.nota2, calificacion.nota3],
    })
  } catch (error) {
    return responderError(res, error)
  }
})

router.post(
  "/",
  validarCalificacion,
  responderErroresValidacion,
  async (req, res) => {
    try {
      const { alumnoId, materiaId, notas } = req.body

      if (!(await alumnoExiste(alumnoId))) {
        return res.status(404).json({ error: "Alumno no encontrado" })
      }

      if (!(await materiaExiste(materiaId))) {
        return res.status(404).json({ error: "Materia no encontrada" })
      }

      if (await registroDuplicado(alumnoId, materiaId)) {
        return res.status(409).json({
          error: "Ya existe una calificación para ese alumno y materia",
        })
      }

      const sql =
        "INSERT INTO calificaciones (alumno_id, materia_id, nota1, nota2, nota3) VALUES (?, ?, ?, ?, ?)"
      const [resultado] = await db.execute(sql, [
        alumnoId,
        materiaId,
        notas[0],
        notas[1],
        notas[2],
      ])

      return res.status(201).json({
        id: resultado.insertId,
        alumnoId,
        materiaId,
        notas,
      })
    } catch (error) {
      return responderError(res, error)
    }
  }
)

router.put(
  "/:id",
  validarId,
  validarCalificacion,
  responderErroresValidacion,
  async (req, res) => {
    try {
      const { id } = req.params
      const { alumnoId, materiaId, notas } = req.body

      const [existentes] = await db.execute(
        "SELECT id FROM calificaciones WHERE id = ?",
        [id]
      )
      if (existentes.length === 0) {
        return res.status(404).json({ error: "Calificación no encontrada" })
      }

      if (!(await alumnoExiste(alumnoId))) {
        return res.status(404).json({ error: "Alumno no encontrado" })
      }

      if (!(await materiaExiste(materiaId))) {
        return res.status(404).json({ error: "Materia no encontrada" })
      }

      if (await registroDuplicado(alumnoId, materiaId, id)) {
        return res.status(409).json({
          error: "Ya existe una calificación para ese alumno y materia",
        })
      }

      await db.execute(
        "UPDATE calificaciones SET alumno_id = ?, materia_id = ?, nota1 = ?, nota2 = ?, nota3 = ? WHERE id = ?",
        [alumnoId, materiaId, notas[0], notas[1], notas[2], id]
      )

      return res.status(200).json({
        mensaje: "Calificación actualizada correctamente",
        id,
        alumnoId,
        materiaId,
        notas,
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
        "DELETE FROM calificaciones WHERE id = ?",
        [id]
      )

      if (resultado.affectedRows === 0) {
        return res.status(404).json({ error: "Calificación no encontrada" })
      }

      return res
        .status(200)
        .json({ mensaje: "Calificación eliminada correctamente" })
    } catch (error) {
      return responderError(res, error)
    }
  }
)

export default router
