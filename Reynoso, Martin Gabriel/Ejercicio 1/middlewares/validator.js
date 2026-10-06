import { body, param, query, validationResult } from 'express-validator';

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: 'error',
      message: 'Error de validación en la solicitud',
      errors: errors.array().map(err => ({ field: err.path, msg: err.msg }))
    });
  }
  next();
};

export const validateId = [
  param('id')
    .isInt({ min: 1 }).withMessage('El ID debe ser un número entero positivo'),
  handleValidationErrors
];

export const validateQueryParams = [
  query('limite')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('El límite debe ser un número entre 1 y 100'),
  handleValidationErrors
];

export const validateRectanguloBody = [
  body('lado1')
    .exists({ checkNull: true }).withMessage('El lado1 es obligatorio')
    .isFloat({ gt: 0 }).withMessage('El lado1 debe ser un número mayor que cero'),
  body('lado2')
    .exists({ checkNull: true }).withMessage('El lado2 es obligatorio')
    .isFloat({ gt: 0 }).withMessage('El lado2 debe ser un número mayor que cero'),
  
  // Verificación estricta: si vienen esos campos en el body, dispara el error
  body('perimetro')
    .custom((value, { req }) => {
      if (req.body.perimetro !== undefined) {
        throw new Error('El perímetro no debe enviarse, se calcula en el servidor');
      }
      return true;
    }),
  body('superficie')
    .custom((value, { req }) => {
      if (req.body.superficie !== undefined) {
        throw new Error('La superficie no debe enviarse, se calcula en el servidor');
      }
      return true;
    }),

  handleValidationErrors
];