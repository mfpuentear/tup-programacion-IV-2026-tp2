const express = require('express');

const {
    obtenerTareas,
    obtenerTarea,
    crearTarea,
    modificarTarea,
    eliminarTarea
} = require('../controllers/tareas.controller');

const {
    body,
    param,
    query,
    validationResult
} = require('express-validator');

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

const validarCompletada = [
    body('completada')
        .custom(value => typeof value === 'boolean')
        .withMessage('completada debe ser true o false')
];

const validarFiltroEstado = [
    query('estado')
        .optional()
        .custom(value => value === 'true' || value === 'false')
        .withMessage('estado debe ser true o false')
];

router.get(
    '/',
    validarFiltroEstado,
    validarErrores,
    obtenerTareas
);

router.get(
    '/:id',
    validarId,
    validarErrores,
    obtenerTarea
);

router.post(
    '/',
    [...validarNombre, ...validarCompletada],
    validarErrores,
    crearTarea
);

router.put(
    '/:id',
    [
        ...validarId,
        ...validarNombre,
        ...validarCompletada
    ],
    validarErrores,
    modificarTarea
);

router.delete(
    '/:id',
    validarId,
    validarErrores,
    eliminarTarea
);

module.exports = router;