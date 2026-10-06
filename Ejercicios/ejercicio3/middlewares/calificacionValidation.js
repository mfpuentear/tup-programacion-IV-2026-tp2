const { body, param, query } = require('express-validator');


const validateIdParam = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('El ID debe ser un número entero positivo')
];


const validateQueryFilter = [
  query('materia_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('El materia_id del filtro debe ser un entero positivo')
];


const notaValidationRule = (fieldName) =>
  body(fieldName)
    .exists().withMessage(`El campo '${fieldName}' es obligatorio`)
    .bail()
    .isFloat({ min: 0, max: 10 })
    .withMessage(`La '${fieldName}' debe ser un valor numérico entre 0.00 y 10.00`);


const validateCreateCalificacion = [
  body('alumno_nombre')
    .exists().withMessage('El nombre del alumno es obligatorio')
    .bail()
    .isString().withMessage('El nombre del alumno debe ser una cadena de texto')
    .bail()
    .trim()
    .notEmpty().withMessage('El nombre del alumno no puede estar vacío'),

  body('materia_id')
    .exists().withMessage('El materia_id es obligatorio')
    .bail()
    .isInt({ min: 1 }).withMessage('El materia_id debe ser un entero positivo válido'),

  notaValidationRule('nota_1'),
  notaValidationRule('nota_2'),
  notaValidationRule('nota_3')
];


const validateUpdateCalificacion = [
  ...validateIdParam,
  body('alumno_nombre')
    .optional()
    .isString().withMessage('El nombre del alumno debe ser una cadena de texto')
    .bail()
    .trim()
    .notEmpty().withMessage('El nombre del alumno no puede estar vacío'),

  body('materia_id')
    .optional()
    .isInt({ min: 1 }).withMessage('El materia_id debe ser un entero positivo válido'),

  body('nota_1').optional().isFloat({ min: 0, max: 10 }).withMessage('La nota_1 debe estar entre 0 y 10'),
  body('nota_2').optional().isFloat({ min: 0, max: 10 }).withMessage('La nota_2 debe estar entre 0 y 10'),
  body('nota_3').optional().isFloat({ min: 0, max: 10 }).withMessage('La nota_3 debe estar entre 0 y 10')
];

module.exports = {
  validateIdParam,
  validateQueryFilter,
  validateCreateCalificacion,
  validateUpdateCalificacion
};