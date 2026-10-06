const { body, param } = require('express-validator');

const validateIdParam = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('El ID debe ser un número entero positivo')
];

const validateRectanguloBody = [
  body('lado_a')
    .exists().withMessage('El lado_a es obligatorio')
    .isFloat({ gt: 0 }).withMessage('El lado_a debe ser un número mayor a 0'),
  
  body('lado_b')
    .exists().withMessage('El lado_b es obligatorio')
    .isFloat({ gt: 0 }).withMessage('El lado_b debe ser un número mayor a 0'),

 
  body('perimetro')
    .custom((value) => {
      if (value !== undefined) {
        throw new Error('El perímetro no debe ser enviado por el cliente; se calcula automáticamente.');
      }
      return true;
    }),
  body('superficie')
    .custom((value) => {
      if (value !== undefined) {
        throw new Error('La superficie no debe ser enviada por el cliente; se calcula automáticamente.');
      }
      return true;
    })
];

module.exports = {
  validateIdParam,
  validateRectanguloBody
};