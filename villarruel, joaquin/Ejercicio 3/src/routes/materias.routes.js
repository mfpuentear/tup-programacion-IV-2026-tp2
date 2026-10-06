const express = require('express');
const { body, param, validationResult } = require('express-validator');

const {
    obtenerMaterias,
    obtenerMateria,
    crearMateria,
    modificarMateria,
    eliminarMateria
} = require('../controllers/materias.controller');

const router = express.Router();

const validarErrores = (req, res, next) => {
    const errores = validationResult(req);

    if (!errores.isEmpty()) {
        return res.status(400).json({
            errores: errores.array()
        });
    }

    next();
};

const validarId = [
    param('id')
        .isInt({ min: 1 })
        .withMessage('El id debe ser un número entero positivo')
];

const validarNombre = [
    body('nombre')
        .isString()
        .withMessage('El nombre debe ser un texto')
        .trim()
        .notEmpty()
        .withMessage('El nombre es obligatorio')
        .isLength({ max: 255 })
        .withMessage('El nombre no puede superar los 255 caracteres')
];

router.get('/', obtenerMaterias);

router.get(
    '/:id',
    validarId,
    validarErrores,
    obtenerMateria
);

router.post(
    '/',
    validarNombre,
    validarErrores,
    crearMateria
);

router.put(
    '/:id',
    [...validarId, ...validarNombre],
    validarErrores,
    modificarMateria
);

router.delete(
    '/:id',
    validarId,
    validarErrores,
    eliminarMateria
);

module.exports = router;