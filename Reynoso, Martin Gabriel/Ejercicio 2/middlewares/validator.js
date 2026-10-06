import { body, param, query, validationResult } from 'express-validator';
import pool from '../config/db.js';

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: 'error',
      message: 'Error de validación en la solicitud',
      errors: errors.array().map(err => ({ field: err.path, msg: err.msg }))
    });
  }
  next();
};

export const validateId = [
  param('id')
    .isInt({ min: 1 }).withMessage('El ID debe ser un número entero positivo'),
  handleValidationErrors
];

export const validateQueryParams = [
  query('completada')
    .optional()
    .isBoolean().withMessage('El filtro "completada" debe ser un valor booleano (true o false)'),
  handleValidationErrors
];

export const validateCrearTareaBody = [
  body('nombre')
    .exists({ checkNull: true }).withMessage('El nombre es obligatorio')
    .isString().withMessage('El nombre debe ser una cadena de texto')
    .trim()
    .notEmpty().withMessage('El nombre no puede estar vacío')
    .isLength({ min: 3, max: 255 }).withMessage('El nombre debe tener entre 3 y 255 caracteres')
    .custom(async (value) => {
      const nombreLimpio = value.trim().toLowerCase();
      const [rows] = await pool.query(
        'SELECT id FROM tareas WHERE LOWER(TRIM(nombre)) = ?',
        [nombreLimpio]
      );
      if (rows.length > 0) {
        throw new Error('Ya existe una tarea con ese mismo nombre');
      }
      return true;
    }),

  body('completada')
    .optional()
    .isBoolean().withMessage('El campo completada debe ser un valor booleano (true o false)'),

  handleValidationErrors
];

export const validateActualizarTareaBody = [
  body('nombre')
    .optional()
    .isString().withMessage('El nombre debe ser una cadena de texto')
    .trim()
    .notEmpty().withMessage('El nombre no puede estar vacío')
    .isLength({ min: 3, max: 255 }).withMessage('El nombre debe tener entre 3 y 255 caracteres')
    .custom(async (value, { req }) => {
      const nombreLimpio = value.trim().toLowerCase();
      const tareaId = req.params.id;

      const [rows] = await pool.query(
        'SELECT id FROM tareas WHERE LOWER(TRIM(nombre)) = ? AND id != ?',
        [nombreLimpio, tareaId]
      );
      if (rows.length > 0) {
        throw new Error('Ya existe otra tarea registrada con ese mismo nombre');
      }
      return true;
    }),

  body('completada')
    .optional()
    .isBoolean().withMessage('El campo completada debe ser un valor booleano (true o false)'),

  handleValidationErrors
];