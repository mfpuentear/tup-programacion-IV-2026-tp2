const { body, param, query, validationResult } = require('express-validator');

const validateTareaBody = [
  body('nombre')
    .exists()
    .withMessage('El nombre es obligatorio')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('El nombre debe tener entre 2 y 100 caracteres'),

  body('completada')
    .exists()
    .withMessage('El estado es obligatorio')
    .isBoolean()
    .withMessage('El estado debe ser un valor booleano válido'),

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

const validateEstadoQuery = [
  query('estado')
    .optional()
    .isIn(['completada', 'pendiente'])
    .withMessage('El filtro de estado debe ser completada o pendiente'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

module.exports = {
  validateTareaBody,
  validateIdParam,
  validateEstadoQuery
};
