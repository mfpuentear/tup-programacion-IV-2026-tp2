const { body, param, validationResult } = require('express-validator');

const validateMateriaBody = [
  body('nombre')
    .exists()
    .withMessage('El nombre de la materia es obligatorio')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('El nombre de la materia debe tener entre 2 y 100 caracteres'),

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
  validateMateriaBody,
  validateIdParam
};
