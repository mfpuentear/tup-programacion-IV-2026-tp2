const { body, param } = require('express-validator');

exports.crearMateriaValidator = [
  body('nombre')
    .exists().withMessage('El campo nombre es obligatorio')
    .trim()
    .notEmpty().withMessage('El nombre de la materia no puede estar vacío')
    .isString().withMessage('El nombre debe ser una cadena de texto')
    .isLength({ min: 2, max: 100 }).withMessage('El nombre debe tener entre 2 y 100 caracteres')
];

exports.idParamValidator = [
  param('id')
    .isInt({ min: 1 }).withMessage('El parámetro ID debe ser un entero positivo')
];  