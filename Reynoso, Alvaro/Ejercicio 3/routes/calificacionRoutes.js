const express = require('express');

const {
    body,
    param,
    validationResult
} = require('express-validator');

const router = express.Router();

const calificacionController = require('../controllers/calificacionController');


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
    '/calificaciones',
    calificacionController.obtenerTodas
);


// Obtener una
router.get(
    '/calificaciones/:id',

    param('id')
        .isInt({ min: 1 })
        .withMessage('El ID debe ser un número entero mayor que 0'),

    validar,

    calificacionController.obtenerUna
);


// Crear
router.post(
    '/calificaciones',

    body('nombreAlumno')
        .exists()
        .withMessage('El nombre del alumno es obligatorio')
        .bail()
        .isString()
        .withMessage('El nombre del alumno debe ser un texto')
        .bail()
        .trim()
        .notEmpty()
        .withMessage('El nombre del alumno no puede estar vacío')
        .isLength({ max: 100 })
        .withMessage('El nombre del alumno no puede superar los 100 caracteres'),

    body('materiaId')
        .exists()
        .withMessage('La materia es obligatoria')
        .bail()
        .isInt({ min: 1 })
        .withMessage('materiaId debe ser un número entero mayor que 0'),

    body('nota1')
        .exists()
        .withMessage('La nota1 es obligatoria')
        .bail()
        .isFloat({ min: 0, max: 10 })
        .withMessage('La nota1 debe estar entre 0 y 10'),

    body('nota2')
        .exists()
        .withMessage('La nota2 es obligatoria')
        .bail()
        .isFloat({ min: 0, max: 10 })
        .withMessage('La nota2 debe estar entre 0 y 10'),

    body('nota3')
        .exists()
        .withMessage('La nota3 es obligatoria')
        .bail()
        .isFloat({ min: 0, max: 10 })
        .withMessage('La nota3 debe estar entre 0 y 10'),

    validar,

    calificacionController.crear
);


// Modificar
router.put(
    '/calificaciones/:id',

    param('id')
        .isInt({ min: 1 })
        .withMessage('El ID debe ser un número entero mayor que 0'),

    body('nombreAlumno')
        .exists()
        .withMessage('El nombre del alumno es obligatorio')
        .bail()
        .isString()
        .withMessage('El nombre del alumno debe ser un texto')
        .bail()
        .trim()
        .notEmpty()
        .withMessage('El nombre del alumno no puede estar vacío')
        .isLength({ max: 100 })
        .withMessage('El nombre del alumno no puede superar los 100 caracteres'),

    body('materiaId')
        .exists()
        .withMessage('La materia es obligatoria')
        .bail()
        .isInt({ min: 1 })
        .withMessage('materiaId debe ser un número entero mayor que 0'),

    body('nota1')
        .exists()
        .withMessage('La nota1 es obligatoria')
        .bail()
        .isFloat({ min: 0, max: 10 })
        .withMessage('La nota1 debe estar entre 0 y 10'),

    body('nota2')
        .exists()
        .withMessage('La nota2 es obligatoria')
        .bail()
        .isFloat({ min: 0, max: 10 })
        .withMessage('La nota2 debe estar entre 0 y 10'),

    body('nota3')
        .exists()
        .withMessage('La nota3 es obligatoria')
        .bail()
        .isFloat({ min: 0, max: 10 })
        .withMessage('La nota3 debe estar entre 0 y 10'),

    validar,

    calificacionController.modificar
);


// Eliminar
router.delete(
    '/calificaciones/:id',

    param('id')
        .isInt({ min: 1 })
        .withMessage('El ID debe ser un número entero mayor que 0'),

    validar,

    calificacionController.eliminar
);


module.exports = router;