const express = require('express');

const {
    body,
    param,
    query,
    validationResult
} = require('express-validator');

const router = express.Router();

const tareaController = require('../controllers/tareaController');


// Middleware para validar errores
const validar = (req, res, next) => {
    const errores = validationResult(req);

    if (!errores.isEmpty()) {
        return res.status(400).json({
            errores: errores.array()
        });
    }

    next();
};


// Obtener todas las tareas
router.get(
    '/tareas',
    tareaController.obtenerTodas
);


// Filtrar tareas por estado
router.get(
    '/tareas/estado',
    query('completada')
        .isBoolean()
        .withMessage('El valor de completada debe ser true o false'),
    validar,
    tareaController.filtrarPorEstado
);


// Obtener una tarea
router.get(
    '/tareas/:id',
    param('id')
        .isInt({ min: 1 })
        .withMessage('El ID debe ser un número entero mayor que 0'),
    validar,
    tareaController.obtenerUna
);


// Crear una tarea
router.post(
    '/tareas',

    body('nombre')
        .exists()
        .withMessage('El nombre es obligatorio')
        .bail()
        .isString()
        .withMessage('El nombre debe ser un texto')
        .bail()
        .trim()
        .notEmpty()
        .withMessage('El nombre no puede estar vacío')
        .isLength({ max: 100 })
        .withMessage('El nombre no puede superar los 100 caracteres'),

    body('completada')
        .exists()
        .withMessage('El estado es obligatorio')
        .bail()
        .isBoolean()
        .withMessage('El estado debe ser true o false'),

    validar,

    tareaController.crear
);


// Modificar una tarea
router.put(
    '/tareas/:id',

    param('id')
        .isInt({ min: 1 })
        .withMessage('El ID debe ser un número entero mayor que 0'),

    body('nombre')
        .exists()
        .withMessage('El nombre es obligatorio')
        .bail()
        .isString()
        .withMessage('El nombre debe ser un texto')
        .bail()
        .trim()
        .notEmpty()
        .withMessage('El nombre no puede estar vacío')
        .isLength({ max: 100 })
        .withMessage('El nombre no puede superar los 100 caracteres'),

    body('completada')
        .exists()
        .withMessage('El estado es obligatorio')
        .bail()
        .isBoolean()
        .withMessage('El estado debe ser true o false'),

    validar,

    tareaController.modificar
);


// Eliminar una tarea
router.delete(
    '/tareas/:id',

    param('id')
        .isInt({ min: 1 })
        .withMessage('El ID debe ser un número entero mayor que 0'),

    validar,

    tareaController.eliminar
);


module.exports = router;