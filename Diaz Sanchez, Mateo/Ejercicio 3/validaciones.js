const { body, param, query, validationResult } = require('express-validator');

function isValidGradeValues(grades) {
  return Array.isArray(grades)
    && grades.length === 3
    && grades.every((grade) => typeof grade === 'number'
      && Number.isFinite(grade)
      && grade >= 0
      && grade <= 10
      && Number(grade.toFixed(2)) === grade);
}

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  next();
};

const noQuery = query().custom((value) => {
  if (Object.keys(value).length) throw new Error('Este recurso no admite parámetros de consulta');
  return true;
});

const knownQuery = (allowed) => query().custom((value) => {
  const unknown = Object.keys(value).filter((key) => !allowed.includes(key));
  if (unknown.length) throw new Error(`Parámetros no admitidos: ${unknown.join(', ')}`);
  return true;
});

const idParam = [
  param('id').isInt({ min: 1 }).withMessage('id debe ser un entero positivo').toInt(),
  validate,
];

const resourceQuery = [noQuery, validate];

const gradesQuery = [
  knownQuery(['alumnoId', 'materiaId', 'limit', 'offset']),
  query('alumnoId').optional().isInt({ min: 1 }).withMessage('alumnoId debe ser positivo').toInt(),
  query('materiaId').optional().isInt({ min: 1 }).withMessage('materiaId debe ser positivo').toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit debe estar entre 1 y 100').toInt(),
  query('offset').optional().isInt({ min: 0 }).withMessage('offset debe ser no negativo').toInt(),
  validate,
];

const exactBody = (allowed) => body().custom((value) => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('El cuerpo debe ser un objeto JSON');
  const unknown = Object.keys(value).filter((key) => !allowed.includes(key));
  if (unknown.length) throw new Error(`Campos no admitidos: ${unknown.join(', ')}`);
  return true;
});

const nameBody = [
  exactBody(['nombre']),
  body('nombre').isString().withMessage('nombre debe ser texto').bail().trim().isLength({ min: 1, max: 120 }).withMessage('nombre debe tener entre 1 y 120 caracteres'),
  validate,
];

const gradeBody = [
  exactBody(['alumnoId', 'materiaId', 'notas']),
  body('alumnoId').isInt({ min: 1 }).withMessage('alumnoId debe ser un entero positivo').toInt(),
  body('materiaId').isInt({ min: 1 }).withMessage('materiaId debe ser un entero positivo').toInt(),
  body('notas').custom(isValidGradeValues).withMessage('notas debe contener exactamente tres números entre 0 y 10, con hasta dos decimales'),
  validate,
];

module.exports = { gradeBody, gradesQuery, idParam, isValidGradeValues, nameBody, resourceQuery };