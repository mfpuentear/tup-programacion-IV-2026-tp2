const { body, param, query, validationResult } = require('express-validator');
const pool = require('../db');
const normalizeTitle = require('../utils/normalizeTitle');


const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: 'error',
      message: 'Error de validación en la solicitud',
      errors: errors.array().map(err => ({ field: err.path, message: err.msg }))
    });
  }
  next();
};

const validateCreateTask = [
  body('title')
    .exists({ checkFalsy: true }).withMessage('El nombre de la tarea es obligatorio.')
    .isString().withMessage('El nombre debe ser una cadena de texto.')
    .trim()
    .isLength({ min: 1, max: 255 }).withMessage('El nombre debe tener entre 1 y 255 caracteres.')
    .custom(async (value) => {
      const canonical = normalizeTitle(value);
      const [rows] = await pool.query('SELECT id FROM tasks WHERE title_canonical = ?', [canonical]);
      if (rows.length > 0) {
        const error = new Error('Ya existe una tarea con este mismo nombre.');
        error.statusCode = 409;
        throw error;
      }
      return true;
    }),
  body('completed')
    .optional()
    .isBoolean().withMessage('El estado completado debe ser un valor booleano (true/false).')
    .toBoolean(),
  handleValidationErrors
];

const validateUpdateTask = [
  param('id')
    .isInt({ gt: 0 }).withMessage('El ID debe ser un número entero positivo.')
    .toInt(),
  body('title')
    .optional()
    .isString().withMessage('El nombre debe ser una cadena de texto.')
    .trim()
    .isLength({ min: 1, max: 255 }).withMessage('El nombre debe tener entre 1 y 255 caracteres.')
    .custom(async (value, { req }) => {
      const canonical = normalizeTitle(value);
      const taskId = req.params.id;
      const [rows] = await pool.query('SELECT id FROM tasks WHERE title_canonical = ? AND id != ?', [canonical, taskId]);
      if (rows.length > 0) {
        const error = new Error('Ya existe otra tarea con este mismo nombre.');
        error.statusCode = 409;
        throw error;
      }
      return true;
    }),
  body('completed')
    .optional()
    .isBoolean().withMessage('El estado completado debe ser un valor booleano (true/false).')
    .toBoolean(),
  body().custom((body) => {
    if (body.title === undefined && body.completed === undefined) {
      throw new Error('Debe proporcionar al menos un campo a actualizar (title o completed).');
    }
    return true;
  }),
  handleValidationErrors
];

const validateTaskIdParam = [
  param('id')
    .isInt({ gt: 0 }).withMessage('El ID debe ser un número entero positivo.')
    .toInt(),
  handleValidationErrors
];

const validateGetTasksQuery = [
  query('completed')
    .optional()
    .isIn(['true', 'false', '1', '0']).withMessage('El filtro completed debe ser un valor booleano admitido (true o false).')
    .toBoolean(),
  handleValidationErrors
];

module.exports = {
  validateCreateTask,
  validateUpdateTask,
  validateTaskIdParam,
  validateGetTasksQuery
};