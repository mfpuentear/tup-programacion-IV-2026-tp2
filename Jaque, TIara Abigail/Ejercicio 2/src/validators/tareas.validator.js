const { body, query, validationResult } = require('express-validator');

const procesarErrores = (req, res, next) => {
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
        return res.status(400).json({ errores: errores.array() });
    }
    next();
};

const validarTarea = [
    body('nombre')
        .exists().withMessage('El campo "nombre" es obligatorio.')
        .isString().withMessage('El nombre debe ser una cadena de texto.')
        .trim()
        .notEmpty().withMessage('El nombre no puede estar vacío.'),
    
    body('completada')
        .optional()
        .isBoolean().withMessage('El estado "completada" debe ser un valor booleano (true o false).'),

    procesarErrores
];

const validarFiltroEstado = [
    query('estado')
        .optional()
        .isIn(['completadas', 'pendientes'])
        .withMessage('El filtro de estado debe ser "completadas" o "pendientes".'),

    procesarErrores
];

module.exports = { validarTarea, validarFiltroEstado };