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
      error: 'Ya existe una tarea con ese nombre'
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

export const validarFiltro = [
  query('completada')
    .optional()
    .isBoolean()
    .withMessage('El filtro completada debe ser true o false')
    .toBoolean()
]

export const validarTareaNueva = [
  body()
    .custom((valor) => {
      const camposPermitidos = ['nombre', 'completada']
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
    .withMessage('El nombre es obligatorio')
    .bail()
    .isString()
    .withMessage('El nombre debe ser un texto')
    .bail()
    .trim()
    .notEmpty()
    .withMessage('El nombre no puede estar vacío')
    .isLength({ max: 100 })
    .withMessage('El nombre no puede superar los 100 caracteres'),

  body('completada')
    .optional()
    .isBoolean()
    .withMessage('completada debe ser true o false')
    .toBoolean()
]

export const validarTareaCompleta = [
  body()
    .custom((valor) => {
      const camposPermitidos = ['nombre', 'completada']
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
    .withMessage('El nombre es obligatorio')
    .bail()
    .isString()
    .withMessage('El nombre debe ser un texto')
    .bail()
    .trim()
    .notEmpty()
    .withMessage('El nombre no puede estar vacío')
    .isLength({ max: 100 })
    .withMessage('El nombre no puede superar los 100 caracteres'),

  body('completada')
    .exists({ checkNull: true })
    .withMessage('El campo completada es obligatorio')
    .bail()
    .isBoolean()
    .withMessage('completada debe ser true o false')
    .toBoolean()
]

export const validarNombreUnico = async (req, res, next) => {
  try {
    const nombre = req.body.nombre.trim()
    const id = req.params.id

    let consulta = `
      SELECT id
      FROM tareas
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
        error: 'Ya existe una tarea con ese nombre'
      })
    }

    next()
  } catch (error) {
    next(error)
  }
}