const { body, param, validationResult } = require('express-validator');

const validarCalificacion = [
  body('alumno')
    .notEmpty().withMessage('El nombre del alumno es obligatorio')
    .isString().withMessage('El nombre del alumno debe ser texto'),

  body('materia_id')
    .notEmpty().withMessage('El ID de la materia es obligatorio')
    .isInt({ min: 1 }).withMessage('El ID de la materia debe ser un entero positivo'),

  body('nota1')
    .notEmpty().withMessage('La nota 1 es obligatoria')
    .isFloat({ min: 1, max: 10 }).withMessage('La nota 1 debe estar entre 1 y 10'),

  body('nota2')
    .notEmpty().withMessage('La nota 2 es obligatoria')
    .isFloat({ min: 1, max: 10 }).withMessage('La nota 2 debe estar entre 1 y 10'),

  body('nota3')
    .notEmpty().withMessage('La nota 3 es obligatoria')
    .isFloat({ min: 1, max: 10 }).withMessage('La nota 3 debe estar entre 1 y 10'),

  (req, res, next) => {
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
      return res.status(400).json({ errores: errores.array() });
    }
    next();
  }
];

const validarId = [
  param('id')
    .isInt({ min: 1 }).withMessage('El ID debe ser un número entero positivo'),

  (req, res, next) => {
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
      return res.status(400).json({ errores: errores.array() });
    }
    next();
  }
];

module.exports = {
  validarCalificacion,
  validarId
};
