const { body, param, validationResult } = require('express-validator');

const validateCalificacionBody = [
  body('alumnoId')
    .exists()
    .withMessage('El alumno es obligatorio')
    .isInt({ min: 1 })
    .withMessage('El alumno debe ser un id válido'),

  body('materiaId')
    .exists()
    .withMessage('La materia es obligatoria')
    .isInt({ min: 1 })
    .withMessage('La materia debe ser un id válido'),

  body('notas')
    .exists()
    .withMessage('Las notas son obligatorias')
    .isArray({ min: 3, max: 3 })
    .withMessage('Debe informar exactamente tres notas'),

  body('notas.*')
    .isFloat({ min: 0, max: 10 })
    .withMessage('Cada nota debe ser un número entre 0 y 10'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

const validateIdParam = [
  param('id')
    .exists()
    .withMessage('El id es obligatorio')
    .isInt({ min: 1 })
    .withMessage('El id debe ser un entero positivo'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

module.exports = {
  validateCalificacionBody,
  validateIdParam
};
