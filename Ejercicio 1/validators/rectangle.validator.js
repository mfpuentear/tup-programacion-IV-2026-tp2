const { body, param, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: 'error',
      message: 'Error de validación en los datos enviados',
      errors: errors.array()
    });
  }
  next();
};

const validateRectangleBody = [
  body('base')
    .exists().withMessage('El campo base es obligatorio')
    .isFloat({ gt: 0 }).withMessage('La base debe ser un número mayor a 0'),
  body('height')
    .exists().withMessage('El campo height es obligatorio')
    .isFloat({ gt: 0 }).withMessage('La altura (height) debe ser un número mayor a 0'),
  body('perimeter')
    .custom((value) => value === undefined)
    .withMessage('El campo perimeter no debe ser enviado por el cliente'),
  body('surface')
    .custom((value) => value === undefined)
    .withMessage('El campo surface no debe ser enviado por el cliente'),
  handleValidationErrors
];

const validateIdParam = [
  param('id')
    .isInt({ gt: 0 }).withMessage('El ID debe ser un entero positivo'),
  handleValidationErrors
];

module.exports = { validateRectangleBody, validateIdParam };