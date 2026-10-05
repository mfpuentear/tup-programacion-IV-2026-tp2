const { body, validationResult } = require('express-validator');

const handleValidation = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errores: errors.array() });
    }
    next();
};

const validarRectangulo = [
    body('lado1')
        .exists().withMessage('El campo lado1 es requerido')
        .isFloat({ gt: 0 }).withMessage('El lado 1 debe ser un número mayor a 0'),
    body('lado2')
        .exists().withMessage('El campo lado2 es requerido')
        .isFloat({ gt: 0 }).withMessage('El lado 2 debe ser un número mayor a 0'),
    handleValidation
];

module.exports = {
    validarRectangulo
};
