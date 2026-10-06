const express = require('express');
const {
    obtenerRectangulos,
    obtenerRectangulo,
    crearRectangulo,
    modificarRectangulo,
    eliminarRectangulo
} = require('../controllers/rectangulos.controller');

const { body, param, validationResult } = require('express-validator');

const router = express.Router();

const validarId = [
    param('id')
        .isInt({ min: 1 })
        .withMessage('El id debe ser un número entero positivo')
];

const validarLados = [
    body('lado_a')
        .notEmpty()
        .withMessage('lado_a es obligatorio')
        .isFloat({ gt: 0 })
        .withMessage('lado_a debe ser un número mayor que cero'),

    body('lado_b')
        .notEmpty()
        .withMessage('lado_b es obligatorio')
        .isFloat({ gt: 0 })
        .withMessage('lado_b debe ser un número mayor que cero')
];

const validarErrores = (req, res, next) => {
    const errores = validationResult(req);

    if (!errores.isEmpty()) {
        return res.status(400).json({
            errores: errores.array()
        });
    }

    next();
};

router.get('/', obtenerRectangulos);

router.get('/:id', validarId, validarErrores, obtenerRectangulo);

router.post('/', validarLados, validarErrores, crearRectangulo);

router.put(
    '/:id',
    [...validarId, ...validarLados],
    validarErrores,
    modificarRectangulo
);

router.delete('/:id', validarId, validarErrores, eliminarRectangulo);

module.exports = router;
