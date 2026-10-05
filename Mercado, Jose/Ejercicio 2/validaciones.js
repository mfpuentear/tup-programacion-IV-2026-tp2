const { body, query, validationResult } = require('express-validator');

const validarErrores = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errores: errors.array() });
    }
    next();
};

const normalizarNombre = (nombre) => nombre.trim().toLowerCase();

const validacionesTarea = [
    body('nombre')
        .notEmpty().withMessage('El nombre es obligatorio')
        .isString().withMessage('El nombre debe ser texto')
        .customSanitizer(normalizarNombre),
    body('completada')
        .optional()
        .isBoolean().withMessage('El estado debe ser un booleano (true o false)')
];

const validacionFiltro = [
    query('estado')
        .optional()
        .isIn(['completadas', 'pendientes']).withMessage('El filtro debe ser "completadas" o "pendientes"')
];

module.exports = { validacionesTarea, validacionFiltro, validarErrores };