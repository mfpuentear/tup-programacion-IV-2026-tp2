const express = require('express');
const { param, validationResult } = require('express-validator');

const router = express.Router();

const alumnoController = require('../controllers/alumnoController');


const validar = (req, res, next) => {
    const errores = validationResult(req);

    if (!errores.isEmpty()) {
        return res.status(400).json({
            errores: errores.array()
        });
    }

    next();
};


router.get(
    '/alumnos',
    alumnoController.obtenerTodos
);


router.get(
    '/alumnos/:nombre',
    param('nombre')
        .trim()
        .notEmpty()
        .withMessage('El nombre del alumno es obligatorio')
        .isLength({ max: 100 })
        .withMessage('El nombre del alumno no puede superar los 100 caracteres'),
    validar,
    alumnoController.obtenerUno
);


module.exports = router;