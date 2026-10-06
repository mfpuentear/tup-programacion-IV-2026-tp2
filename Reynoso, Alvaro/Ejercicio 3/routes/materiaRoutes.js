const express = require('express');

const {
    body,
    param,
    validationResult
} = require('express-validator');

const router = express.Router();

const materiaController = require('../controllers/materiaController');


const validar = (req, res, next) => {
    const errores = validationResult(req);

    if (!errores.isEmpty()) {
        return res.status(400).json({
            errores: errores.array()
        });
    }

    next();
};


// Obtener todas
router.get(
    '/materias',
    materiaController.obtenerTodas
);


// Obtener una
router.get(
    '/materias/:id',
    param('id')
        .isInt({ min: 1 })
        .withMessage('El ID debe ser un número entero mayor que 0'),
    validar,
    materiaController.obtenerUna
);


// Crear
router.post(
    '/materias',

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

    validar,

    materiaController.crear
);


// Modificar
router.put(
    '/materias/:id',

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

    validar,

    materiaController.modificar
);


// Eliminar
router.delete(
    '/materias/:id',

    param('id')
        .isInt({ min: 1 })
        .withMessage('El ID debe ser un número entero mayor que 0'),

    validar,

    materiaController.eliminar
);


module.exports = router;