const { body, param, query, validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  next();
};

const knownKeys = (allowed) => query().custom((value) => {
  const unknown = Object.keys(value).filter((key) => !allowed.includes(key));
  if (unknown.length) throw new Error(`Parámetros no admitidos: ${unknown.join(', ')}`);
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
  knownKeys(['estado', 'limit', 'offset']),
  query('estado').optional().isIn(['pendiente', 'completada']).withMessage('estado debe ser pendiente o completada'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit debe estar entre 1 y 100').toInt(),
  query('offset').optional().isInt({ min: 0 }).withMessage('offset debe ser un entero no negativo').toInt(),
  validate,
];

const onlyBodyKeys = (allowed) => body().custom((value) => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('El cuerpo debe ser un objeto JSON');
  const unknown = Object.keys(value).filter((key) => !allowed.includes(key));
  if (unknown.length) throw new Error(`Campos no admitidos: ${unknown.join(', ')}`);
  return true;
});

const createBody = [
  onlyBodyKeys(['nombre', 'completada']),
  body('nombre').isString().withMessage('nombre debe ser texto').bail().trim().isLength({ min: 1, max: 120 }).withMessage('nombre debe tener entre 1 y 120 caracteres'),
  body('completada').optional().custom((value) => typeof value === 'boolean').withMessage('completada debe ser un booleano'),
  validate,
];

const updateBody = [
  onlyBodyKeys(['nombre', 'completada']),
  body('nombre').isString().withMessage('nombre debe ser texto').bail().trim().isLength({ min: 1, max: 120 }).withMessage('nombre debe tener entre 1 y 120 caracteres'),
  body('completada').custom((value) => typeof value === 'boolean').withMessage('completada debe ser un booleano'),
  validate,
];

module.exports = { createBody, idParam, listQuery, noQuery, updateBody };