const { Router } = require('express');
const { body, param } = require('express-validator');
const {
  getRectangulos,
  getRectanguloById,
  createRectangulo,
  updateRectangulo,
  deleteRectangulo
} = require('../controllers/rectangulos');

const router = Router();

// Middleware para verificar que no se envíe ni perimetro ni superficie, ni otras propiedades indebidas
const validarCuerpoRectangulo = [
  body().custom(body => {
    const permitidos = ['lado1', 'lado2'];
    const keys = Object.keys(body);
    for (const key of keys) {
      if (!permitidos.includes(key)) {
        throw new Error(`El campo '${key}' no está permitido. Solo se deben enviar lado1 y lado2.`);
      }
    }
    return true;
  }),
  body('lado1')
    .exists().withMessage('El lado1 es obligatorio')
    .isFloat({ gt: 0 }).withMessage('El lado1 debe ser un número mayor a cero'),
  body('lado2')
    .exists().withMessage('El lado2 es obligatorio')
    .isFloat({ gt: 0 }).withMessage('El lado2 debe ser un número mayor a cero')
];

const validarId = [
  param('id').isInt({ gt: 0 }).withMessage('El ID debe ser un entero positivo')
];

router.get('/', getRectangulos);
router.get('/:id', validarId, getRectanguloById);
router.post('/', validarCuerpoRectangulo, createRectangulo);
router.put('/:id', [...validarId, ...validarCuerpoRectangulo], updateRectangulo);
router.delete('/:id', validarId, deleteRectangulo);

module.exports = router;
