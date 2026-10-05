const { body, param, validationResult } = require('express-validator');

const validarTarea = [
  body('titulo')
    .notEmpty().withMessage('El título es obligatorio')
    .isString().withMessage('El título debe ser una cadena de texto')
    .isLength({ max: 150 }).withMessage('El título no puede superar los 150 caracteres'),
  
  body('descripcion')
    .optional()
    .isString().withMessage('La descripción debe ser una cadena de texto'),

  body('completada')
    .optional()
    .isBoolean().withMessage('El campo completada debe ser un valor booleano (true/false)'),

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
  validarTarea,
  validarId
};
