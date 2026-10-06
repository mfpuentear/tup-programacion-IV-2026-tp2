const { Router } = require('express');
const { body, param } = require('express-validator');
const {
  getCalificaciones,
  createCalificacion,
  updateCalificacion,
  deleteCalificacion
} = require('../controllers/calificaciones');

const router = Router();

const validarNotas = (notas) => {
  if (!Array.isArray(notas)) {
    throw new Error('Las notas deben enviarse en un arreglo');
  }
  if (notas.length !== 3) {
    throw new Error('Se deben informar exactamente tres notas');
  }
  for (let i = 0; i < notas.length; i++) {
    if (typeof notas[i] !== 'number' || notas[i] < 1 || notas[i] > 10) {
      throw new Error(`La nota en la posición ${i} es inválida. Debe ser un número entre 1 y 10.`);
    }
  }
  return true;
};

const validarCrear = [
  body('alumno')
    .exists().withMessage('El nombre del alumno es obligatorio')
    .isString().withMessage('El nombre debe ser un texto')
    .notEmpty().withMessage('El nombre no puede estar vacío'),
  body('materiaId')
    .exists().withMessage('El ID de la materia es obligatorio')
    .isInt({ gt: 0 }).withMessage('El ID de la materia debe ser un entero positivo'),
  body('notas').custom(validarNotas)
];

const validarActualizar = [
  param('id').isInt({ gt: 0 }).withMessage('El ID debe ser un entero positivo'),
  body('alumno')
    .optional()
    .isString().withMessage('El nombre debe ser un texto')
    .notEmpty().withMessage('El nombre no puede estar vacío'),
  body('materiaId')
    .optional()
    .isInt({ gt: 0 }).withMessage('El ID de la materia debe ser un entero positivo'),
  body('notas').optional().custom(validarNotas)
];

const validarId = [
  param('id').isInt({ gt: 0 }).withMessage('El ID debe ser un entero positivo')
];

router.get('/', getCalificaciones);
router.post('/', validarCrear, createCalificacion);
router.put('/:id', validarActualizar, updateCalificacion);
router.delete('/:id', validarId, deleteCalificacion);

module.exports = router;
