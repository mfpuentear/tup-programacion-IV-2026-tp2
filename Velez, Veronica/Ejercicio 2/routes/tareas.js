const { Router } = require('express');
const { body, query, param } = require('express-validator');
const {
  getTareas,
  createTarea,
  updateTarea,
  deleteTarea
} = require('../controllers/tareas');

const router = Router();

// Validaciones
const validarCrear = [
  body('nombre')
    .exists().withMessage('El nombre es obligatorio')
    .isString().withMessage('El nombre debe ser un texto')
    .notEmpty().withMessage('El nombre no puede estar vacío')
    .trim(),
  body('completada')
    .optional()
    .isBoolean().withMessage('El estado debe ser booleano (true o false)')
];

const validarActualizar = [
  param('id').isInt({ gt: 0 }).withMessage('El ID debe ser un entero positivo'),
  body('nombre')
    .optional()
    .isString().withMessage('El nombre debe ser un texto')
    .notEmpty().withMessage('El nombre no puede estar vacío')
    .trim(),
  body('completada')
    .optional()
    .isBoolean().withMessage('El estado debe ser booleano (true o false)')
];

const validarQuery = [
  query('estado')
    .optional()
    .isIn(['completada', 'pendiente']).withMessage('El estado debe ser "completada" o "pendiente"')
];

const validarId = [
  param('id').isInt({ gt: 0 }).withMessage('El ID debe ser un entero positivo')
];

router.get('/', validarQuery, getTareas);
router.post('/', validarCrear, createTarea);
router.put('/:id', validarActualizar, updateTarea);
router.delete('/:id', validarId, deleteTarea);

module.exports = router;
