const { body, param, validationResult } = require('express-validator');

const validateRectanguloBody = [
  body('ladoA')
    .exists()
    .withMessage('El lado A es obligatorio')
    .isNumeric()
    .withMessage('El lado A debe ser un número')
    .custom((value) => Number(value) > 0)
    .withMessage('El lado A debe ser mayor que cero'),

  body('ladoB')
    .exists()
    .withMessage('El lado B es obligatorio')
    .isNumeric()
    .withMessage('El lado B debe ser un número')
    .custom((value) => Number(value) > 0)
    .withMessage('El lado B debe ser mayor que cero'),

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
    .withMessage('El id debe ser un número entero positivo'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

module.exports = {
  validateRectanguloBody,
  validateIdParam
};
