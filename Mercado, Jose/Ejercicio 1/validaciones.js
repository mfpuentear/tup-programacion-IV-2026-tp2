const { body, validationResult } = require('express-validator');

const validarErrores = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errores: errors.array() });
    }
    next();
};

const validacionesRectangulo = [
    body('base').isFloat({ gt: 0 }),
    body('altura').isFloat({ gt: 0 })
];

module.exports = { validarErrores, validacionesRectangulo };