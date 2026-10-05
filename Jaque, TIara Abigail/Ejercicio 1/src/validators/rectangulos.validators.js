const { body, validationResult } = require('express-validator');

const procesarErrores = (req, res, next) => {
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
        return res.status(400).json({ errores: errores.array() });
    }
    next();
};

const validarRectangulo = [
    body('base')
        .exists().withMessage('El campo "base" es obligatorio.')
        .isFloat({ gt: 0 }).withMessage('La base debe ser un número mayor a cero.'),
    
    body('altura')
        .exists().withMessage('El campo "altura" es obligatorio.')
        .isFloat({ gt: 0 }).withMessage('La altura debe ser un número mayor a cero.'),

    body('perimetro').not().exists().withMessage('No se permite enviar el perímetro.'),
    body('superficie').not().exists().withMessage('No se permite enviar la superficie.'),

    procesarErrores
];

module.exports = { validarRectangulo };