const { body, validationResult } = require('express-validator');

const procesarErrores = (req, res, next) => {
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
        return res.status(400).json({ errores: errores.array() });
    }
    next();
};

const validarMateria = [
    body('nombre')
        .exists().withMessage('El campo "nombre" es obligatorio.')
        .isString().withMessage('El nombre de la materia debe ser texto.')
        .trim()
        .notEmpty().withMessage('El nombre de la materia no puede estar vacío.'),
    procesarErrores
];

module.exports = { validarMateria };