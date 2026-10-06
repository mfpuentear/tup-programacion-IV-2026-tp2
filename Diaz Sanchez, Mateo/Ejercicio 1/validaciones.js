const { body, param, query, validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  next();
};

const knownQuery = (allowed) => query().custom((value) => {
  const unknown = Object.keys(value).filter((key) => !allowed.includes(key));
  if (unknown.length) throw new Error(`Parámetros de consulta no admitidos: ${unknown.join(', ')}`);
  return true;
});

const noQuery = [
  query().custom((value) => {
    if (Object.keys(value).length) throw new Error('Este recurso no admite parámetros de consulta');
    return true;
  }),
  validate,
];

const idParam = [
  param('id').isInt({ min: 1 }).withMessage('id debe ser un entero positivo').toInt(),
  validate,
];

const listQuery = [
  knownQuery(['limit', 'offset']),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit debe estar entre 1 y 100').toInt(),
  query('offset').optional().isInt({ min: 0 }).withMessage('offset debe ser un entero no negativo').toInt(),
  validate,
];

const rectangleBody = [
  body().custom((value) => {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      throw new Error('El cuerpo debe ser un objeto JSON');
    }
    const keys = Object.keys(value).sort();
    if (keys.join(',') !== 'ladoA,ladoB') {
      throw new Error('El cuerpo solo puede contener ladoA y ladoB');
    }
    return true;
  }),
  body('ladoA').isFloat({ gt: 0, max: 1000000 })
    .withMessage('ladoA debe ser numérico, mayor que 0 y como máximo 1000000')
    .bail()
    .custom((value) => /^\d+(?:\.\d{1,4})?$/.test(String(value)))
    .withMessage('ladoA admite como máximo cuatro decimales')
    .toFloat(),
  body('ladoB').isFloat({ gt: 0, max: 1000000 })
    .withMessage('ladoB debe ser numérico, mayor que 0 y como máximo 1000000')
    .bail()
    .custom((value) => /^\d+(?:\.\d{1,4})?$/.test(String(value)))
    .withMessage('ladoB admite como máximo cuatro decimales')
    .toFloat(),
  validate,
];

module.exports = { idParam, listQuery, noQuery, rectangleBody };