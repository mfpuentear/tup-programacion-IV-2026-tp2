const { body, param, query } = require('express-validator');


const validateIdParam = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('El ID debe ser un número entero positivo')
];


const validateQueryFilter = [
  query('completada')
    .optional()
    .isBoolean()
    .withMessage("El filtro 'completada' debe ser un valor booleano ('true' o 'false')")
    .toBoolean()
];

const validateCreateTarea = [
  body('nombre')
    .exists().withMessage('El nombre de la tarea es obligatorio')
    .bail()
    .isString().withMessage('El nombre debe ser una cadena de texto')
    .bail()
    .trim()
    .notEmpty().withMessage('El nombre no puede estar vacío'),
  body('completada')
    .optional()
    .isBoolean().withMessage("El campo 'completada' debe ser booleano")
    .toBoolean()
];


const validateUpdateTarea = [
  ...validateIdParam,
  body('nombre')
    .optional()
    .isString().withMessage('El nombre debe ser una cadena de texto')
    .bail()
    .trim()
    .notEmpty().withMessage('El nombre no puede estar vacío'),
  body('completada')
    .optional()
    .isBoolean().withMessage("El campo 'completada' debe ser booleano")
    .toBoolean()
];

module.exports = {
  validateIdParam,
  validateQueryFilter,
  validateCreateTarea,
  validateUpdateTarea
};