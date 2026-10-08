const { body, param, query, validationResult } = require('express-validator');

// Middleware para capturar los errores de validación
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ status: 'fail', errors: errors.array() });
  }
  next();
};

// Validaciones para crear tarea
const createTaskValidation = [
  body('title')
    .trim()
    .notEmpty().withMessage('El título es obligatorio')
    .isLength({ max: 255 }).withMessage('El título no puede superar los 255 caracteres'),
  body('description')
    .optional()
    .trim(),
  body('completed')
    .optional()
    .isBoolean().withMessage('El campo completed debe ser un valor booleano (true/false)'),
  handleValidationErrors
];

// Validaciones para actualizar tarea
const updateTaskValidation = [
  param('id')
    .isInt({ min: 1 }).withMessage('El ID debe ser un número entero positivo'),
  body('title')
    .optional()
    .trim()
    .notEmpty().withMessage('El título no puede estar vacío')
    .isLength({ max: 255 }).withMessage('El título no puede superar los 255 caracteres'),
  body('description')
    .optional()
    .trim(),
  body('completed')
    .optional()
    .isBoolean().withMessage('El campo completed debe ser un valor booleano (true/false)'),
  handleValidationErrors
];

// Validación para rutas por ID
const getByIdValidation = [
  param('id')
    .isInt({ min: 1 }).withMessage('El ID debe ser un número entero positivo'),
  handleValidationErrors
];

// Validación para filtrado por query
const filterQueryValidation = [
  query('completed')
    .optional()
    .isBoolean().withMessage('El filtro completed debe ser true o false'),
  handleValidationErrors
];

module.exports = {
  createTaskValidation,
  updateTaskValidation,
  getByIdValidation,
  filterQueryValidation
};