const { body, param, validationResult } = require('express-validator');

const validarErrores = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errores: errors.array() });
    }
    next();
};

const validacionesCalificacion = [
    body('alumno_nombre').notEmpty().withMessage('El nombre es obligatorio').isString().trim(),
    body('materia_id').notEmpty().isInt({ gt: 0 }),
    body('nota1').isFloat({ min: 1, max: 10 }),
    body('nota2').isFloat({ min: 1, max: 10 }),
    body('nota3').isFloat({ min: 1, max: 10 })
];

const validacionId = [
    param('id').isInt({ gt: 0 })
];

module.exports = { validarErrores, validacionesCalificacion, validacionId };