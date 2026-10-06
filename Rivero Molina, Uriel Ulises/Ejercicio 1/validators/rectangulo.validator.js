const { body, param, query } = require('express-validator');

const validateRectangleBody = [
    body('lado1')
        .exists().withMessage('El lado1 es obligatorio')
        .isFloat({ gt: 0 }).withMessage('El lado1 debe ser un número mayor a cero')
        .toFloat(),
    body('lado2')
        .exists().withMessage('El lado2 es obligatorio')
        .isFloat({ gt: 0 }).withMessage('El lado2 debe ser un número mayor a cero')
        .toFloat(),
    body(['perimetro', 'superficie'])
        .custom((value) => {
            if (value !== undefined) {
                throw new Error('Los campos perimetro y superficie no deben enviarse desde el cliente');
            }
            return true;
        })
];

const validateIdParam = [
    param('id')
        .isInt({ gt: 0 }).withMessage('El ID debe ser un número entero mayor a 0')
        .toInt()
];

const validateQueryParams = [
    query('limit')
        .optional()
        .isInt({ gt: 0 }).withMessage('El límite debe ser un número entero mayor a 0')
        .toInt(),
    query('page')
        .optional()
        .isInt({ gt: 0 }).withMessage('La página debe ser un número entero mayor a 0')
        .toInt()
];

module.exports = {
    validateRectangleBody,
    validateIdParam,
    validateQueryParams
};