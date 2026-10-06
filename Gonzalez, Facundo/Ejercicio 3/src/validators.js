import { body, param, query, validationResult } from 'express-validator'
import { pool } from './db.js'

export const manejarErrores = (req, res, next) => {
  const errores = validationResult(req)

  if (!errores.isEmpty()) {
    return res.status(400).json({
      errores: errores.array()
    })
  }

  next()
}

export const manejarConflicto = (error, req, res, next) => {
  if (error.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({
      error: 'Ya existe un registro con esos datos'
    })
  }

  next(error)
}

export const validarId = [
  param('id')
    .exists()
    .withMessage('El ID es obligatorio')
    .bail()
    .isInt({ min: 1 })
    .withMessage('El ID debe ser un entero positivo')
    .toInt()
]

export const validarMateriaNueva = [
  body()
    .custom((valor) => {
      const camposPermitidos = ['nombre']
      const camposRecibidos = Object.keys(valor || {})

      const camposInvalidos = camposRecibidos.filter(
        campo => !camposPermitidos.includes(campo)
      )

      if (camposInvalidos.length > 0) {
        throw new Error(
          `No se permiten los campos: ${camposInvalidos.join(', ')}`
        )
      }

      return true
    }),

  body('nombre')
    .exists({ checkNull: true })
    .withMessage('El nombre de la materia es obligatorio')
    .bail()
    .isString()
    .withMessage('El nombre de la materia debe ser un texto')
    .bail()
    .trim()
    .notEmpty()
    .withMessage('El nombre de la materia no puede estar vacío')
    .isLength({ max: 100 })
    .withMessage('El nombre de la materia no puede superar los 100 caracteres')
]

export const validarCalificacionNueva = [
  body()
    .custom((valor) => {
      const camposPermitidos = [
        'alumno',
        'materia_id',
        'nota1',
        'nota2',
        'nota3'
      ]

      const camposRecibidos = Object.keys(valor || {})

      const camposInvalidos = camposRecibidos.filter(
        campo => !camposPermitidos.includes(campo)
      )

      if (camposInvalidos.length > 0) {
        throw new Error(
          `No se permiten los campos: ${camposInvalidos.join(', ')}`
        )
      }

      return true
    }),

  body('alumno')
    .exists({ checkNull: true })
    .withMessage('El nombre del alumno es obligatorio')
    .bail()
    .isString()
    .withMessage('El nombre del alumno debe ser un texto')
    .bail()
    .trim()
    .notEmpty()
    .withMessage('El nombre del alumno no puede estar vacío')
    .isLength({ max: 100 })
    .withMessage('El nombre del alumno no puede superar los 100 caracteres'),

  body('materia_id')
    .exists({ checkNull: true })
    .withMessage('El ID de la materia es obligatorio')
    .bail()
    .isInt({ min: 1 })
    .withMessage('materia_id debe ser un entero positivo')
    .toInt(),

  body('nota1')
    .exists({ checkNull: true })
    .withMessage('La nota1 es obligatoria')
    .bail()
    .isFloat({ min: 0, max: 10 })
    .withMessage('La nota1 debe ser un número entre 0 y 10')
    .toFloat(),

  body('nota2')
    .exists({ checkNull: true })
    .withMessage('La nota2 es obligatoria')
    .bail()
    .isFloat({ min: 0, max: 10 })
    .withMessage('La nota2 debe ser un número entre 0 y 10')
    .toFloat(),

  body('nota3')
    .exists({ checkNull: true })
    .withMessage('La nota3 es obligatoria')
    .bail()
    .isFloat({ min: 0, max: 10 })
    .withMessage('La nota3 debe ser un número entre 0 y 10')
    .toFloat()
]

export const validarFiltro = [
  query('alumno')
    .optional()
    .isString()
    .withMessage('El filtro alumno debe ser un texto')
    .trim(),

  query('materia_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('El filtro materia_id debe ser un entero positivo')
    .toInt()
]

export const validarMateriaExiste = async (req, res, next) => {
  try {
    const materiaId = req.body.materia_id

    const [filas] = await pool.query(
      'SELECT id FROM materias WHERE id = ?',
      [materiaId]
    )

    if (filas.length === 0) {
      return res.status(400).json({
        error: 'La materia indicada no existe'
      })
    }

    next()
  } catch (error) {
    next(error)
  }
}

export const validarCalificacionUnica = async (req, res, next) => {
  try {
    const alumno = req.body.alumno.trim()
    const materiaId = req.body.materia_id
    const id = req.params.id

    let consulta = `
      SELECT id
      FROM calificaciones
      WHERE LOWER(alumno) = LOWER(?)
      AND materia_id = ?
    `

    const valores = [alumno, materiaId]

    if (id !== undefined) {
      consulta += ' AND id <> ?'
      valores.push(id)
    }

    const [filas] = await pool.query(consulta, valores)

    if (filas.length > 0) {
      return res.status(409).json({
        error: 'El alumno ya tiene una calificación registrada para esa materia'
      })
    }

    next()
  } catch (error) {
    next(error)
  }
}

export const validarMateriaUnica = async (req, res, next) => {
  try {
    const nombre = req.body.nombre.trim()
    const id = req.params.id

    let consulta = `
      SELECT id
      FROM materias
      WHERE LOWER(nombre) = LOWER(?)
    `

    const valores = [nombre]

    if (id !== undefined) {
      consulta += ' AND id <> ?'
      valores.push(id)
    }

    const [filas] = await pool.query(consulta, valores)

    if (filas.length > 0) {
      return res.status(409).json({
        error: 'Ya existe una materia con ese nombre'
      })
    }

    next()
  } catch (error) {
    next(error)
  }
}