const { body, param, validationResult } = require('express-validator');

const validarLados = [
  body('lado_a')
    .exists({ checkFalsy: false }).withMessage('lado_a es requerido')
    .bail()
    .isFloat({ gt: 0 }).withMessage('lado_a debe ser un numero mayor a 0')
    .toFloat(),
  body('lado_b')
    .exists({ checkFalsy: false }).withMessage('lado_b es requerido')
    .bail()
    .isFloat({ gt: 0 }).withMessage('lado_b debe ser un numero mayor a 0')
    .toFloat(),
];

// Valida que el :id de la URL sea un entero positivo.
const validarIdParam = [
  param('id')
    .isInt({ gt: 0 }).withMessage('id debe ser un entero positivo')
    .toInt(),
];

// Middleware que corta la cadena si alguna validacion anterior fallo.
function manejarErroresDeValidacion(req, res, next) {
  const errores = validationResult(req);
  if (!errores.isEmpty()) {
    return res.status(400).json({
      mensaje: 'Datos invalidos',
      errores: errores.array().map((e) => ({ campo: e.path, detalle: e.msg })),
    });
  }
  next();
}

module.exports = { validarLados, validarIdParam, manejarErroresDeValidacion };
