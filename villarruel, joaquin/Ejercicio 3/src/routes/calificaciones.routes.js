const express = require('express');
const { body, param, validationResult } = require('express-validator');

const {
    obtenerCalificaciones,
    obtenerCalificacion,
    crearCalificacion,
    modificarCalificacion,
    eliminarCalificacion
} = require('../controllers/calificaciones.controller');

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

const validarCalificacion = [
    body('alumno')
        .isString()
        .withMessage('El alumno debe ser un texto')
        .trim()
        .notEmpty()
        .withMessage('El nombre del alumno es obligatorio')
        .isLength({ max: 255 })
        .withMessage('El nombre no puede superar los 255 caracteres'),

    body('materia_id')
        .isInt({ min: 1 })
        .withMessage('materia_id debe ser un número entero positivo'),

    body('notas')
        .isArray({ min: 3, max: 3 })
        .withMessage('Se deben informar exactamente tres notas'),

    body('notas.*')
        .isFloat({ min: 0, max: 10 })
        .withMessage('Cada nota debe ser numérica y estar entre 0 y 10')
];

router.get('/', obtenerCalificaciones);

router.get(
    '/:id',
    validarId,
    validarErrores,
    obtenerCalificacion
);

router.post(
    '/',
    validarCalificacion,
    validarErrores,
    crearCalificacion
);

router.put(
    '/:id',
    [...validarId, ...validarCalificacion],
    validarErrores,
    modificarCalificacion
);

router.delete(
    '/:id',
    validarId,
    validarErrores,
    eliminarCalificacion
);

module.exports = router;