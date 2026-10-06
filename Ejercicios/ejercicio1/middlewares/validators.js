const { body, param, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: 'error',
      errors: errors.array().map(err => ({ campo: err.path, mensaje: err.msg }))
    });
  }
  next();
};

const validateRectangleBody = [
  body('lado_a')
    .exists().withMessage('El lado_a es obligatorio')
    .isFloat({ gt: 0 }).withMessage('El lado_a debe ser un número mayor a 0'),
  body('lado_b')
    .exists().withMessage('El lado_b es obligatorio')
    .isFloat({ gt: 0 }).withMessage('El lado_b debe ser un número mayor a 0'),
  handleValidationErrors
];

const validateIdParam = [
  param('id')
    .isInt({ gt: 0 }).withMessage('El ID debe ser un número entero mayor a 0'),
  handleValidationErrors
];

module.exports = {
  validateRectangleBody,
  validateIdParam
};  
