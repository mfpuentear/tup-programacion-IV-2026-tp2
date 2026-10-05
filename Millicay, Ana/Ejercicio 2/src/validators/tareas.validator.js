const { body, param, query, validationResult } = require('express-validator');

const validar = (req, res, next) => {
  const errores = validationResult(req);
  if (!errores.isEmpty()) {
    return res.status(400).json({ errores: errores.array() });
  }
  next();
};

// Nombre: obligatorio, texto, sin espacios sobrantes, máximo 100 caracteres
// y con al menos una letra o un número.
const nombre = body('nombre')
  .exists().withMessage('El nombre es obligatorio').bail()
  .isString().withMessage('El nombre debe ser un texto').bail()
  .customSanitizer((v) => v.trim().replace(/\s+/g, ' '))
  .notEmpty().withMessage('El nombre no puede estar vacío').bail()
  .isLength({ max: 100 }).withMessage('El nombre no puede superar los 100 caracteres').bail()
  .matches(/[\p{L}\p{N}]/u).withMessage('El nombre debe contener al menos una letra o un número');

// Estado: tiene que ser un booleano real de JSON (true o false)
const completada = (obligatoria) => {
  const campo = body('completada');
  if (obligatoria) {
    campo.exists().withMessage('El estado (completada) es obligatorio').bail();
  } else {
    campo.optional();
  }
  return campo.custom((v) => typeof v === 'boolean')
    .withMessage('completada debe ser true o false (booleano)');
};

const idParam = param('id')
  .isInt({ min: 1 }).withMessage('El id debe ser un entero positivo')
  .toInt();

module.exports = {
  crear: [nombre, completada(false), validar],
  actualizar: [idParam, nombre, completada(true), validar],
  cambiarEstado: [idParam, completada(true), validar],
  porId: [idParam, validar],
  listar: [
    query('estado')
      .optional()
      .isIn(['completadas', 'pendientes'])
      .withMessage('estado debe ser "completadas" o "pendientes"'),
    validar,
  ],
};