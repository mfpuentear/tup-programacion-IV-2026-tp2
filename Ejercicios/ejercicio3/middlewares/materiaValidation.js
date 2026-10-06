const { body, param } = require('express-validator');


const validateMateriaId = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('El ID de la materia debe ser un número entero positivo')
];


const validateMateriaBody = [
  body('nombre')
    .exists().withMessage('El nombre de la materia es obligatorio')
    .bail()
    .isString().withMessage('El nombre debe ser una cadena de texto')
    .bail()
    .trim()
    .notEmpty().withMessage('El nombre de la materia no puede estar vacío')
];

module.exports = {
  validateMateriaId,
  validateMateriaBody
};