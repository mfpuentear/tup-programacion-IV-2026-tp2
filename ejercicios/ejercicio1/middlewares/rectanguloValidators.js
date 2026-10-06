const { body, param, query, validationResult } = require('express-validator');


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


const validateCreateRectangulo = [
  body('lado_a')
    .exists({ checkFalsy: true }).withMessage('El lado_a es obligatorio.')
    .isFloat({ gt: 0 }).withMessage('El lado_a debe ser un número positivo mayor que cero.')
    .toFloat(),
  body('lado_b')
    .exists({ checkFalsy: true }).withMessage('El lado_b es obligatorio.')
    .isFloat({ gt: 0 }).withMessage('El lado_b debe ser un número positivo mayor que cero.')
    .toFloat(),
  body('perimetro')
    .custom((val) => {
      if (val !== undefined) throw new Error('El perímetro no debe ser proporcionado; se calcula automáticamente en el servidor.');
      return true;
    }),
  body('superficie')
    .custom((val) => {
      if (val !== undefined) throw new Error('La superficie no debe ser proporcionada; se calcula automáticamente en el servidor.');
      return true;
    }),
  handleValidationErrors
];


const validateUpdateRectangulo = [
  param('id')
    .isInt({ gt: 0 }).withMessage('El ID del parámetro de ruta debe ser un entero positivo.')
    .toInt(),
  body('lado_a')
    .optional()
    .isFloat({ gt: 0 }).withMessage('El lado_a debe ser un número positivo mayor que cero.')
    .toFloat(),
  body('lado_b')
    .optional()
    .isFloat({ gt: 0 }).withMessage('El lado_b debe ser un número positivo mayor que cero.')
    .toFloat(),
  body('perimetro')
    .custom((val) => {
      if (val !== undefined) throw new Error('El perímetro no debe ser proporcionado; se calcula automáticamente en el servidor.');
      return true;
    }),
  body('superficie')
    .custom((val) => {
      if (val !== undefined) throw new Error('La superficie no debe ser proporcionada; se calcula automáticamente en el servidor.');
      return true;
    }),
  body().custom((b) => {
    if (b.lado_a === undefined && b.lado_b === undefined) {
      throw new Error('Debe proporcionar al menos un lado (lado_a o lado_b) para actualizar.');
    }
    return true;
  }),
  handleValidationErrors
];


const validateIdParam = [
  param('id')
    .isInt({ gt: 0 }).withMessage('El ID debe ser un entero positivo.')
    .toInt(),
  handleValidationErrors
];


const validateQueryOptions = [
  query('limite')
    .optional()
    .isInt({ gt: 0, max: 100 }).withMessage('El límite de consulta debe ser un entero entre 1 y 100.')
    .toInt(),
  handleValidationErrors
];

module.exports = {
  validateCreateRectangulo,
  validateUpdateRectangulo,
  validateIdParam,
  validateQueryOptions
};