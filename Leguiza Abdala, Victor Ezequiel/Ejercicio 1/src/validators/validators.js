import { validationResult, body, param } from 'express-validator';

export const revisarErrores = (req, res, next) => {
  const fallos = validationResult(req);
  if (!fallos.isEmpty()) {
    return res.status(400).json({ errores: fallos.array() });
  }
  next();
};

export const validarFigura = [
  body('medida_base')
    .exists().withMessage('La medida_base es obligatoria')
    .bail()
    .isNumeric().withMessage('La base debe ser numérica')
    .bail()
    .isFloat({ gt: 0 }).withMessage('La base debe ser mayor a cero')
    .toFloat(),

  body('medida_altura')
    .exists().withMessage('La medida_altura es obligatoria')
    .bail()
    .isNumeric().withMessage('La altura debe ser numérica')
    .bail()
    .isFloat({ gt: 0 }).withMessage('La altura debe ser mayor a cero')
    .toFloat(),

  body('perimetro')
    .not().exists().withMessage('El servidor calcula el perímetro automáticamente, no lo envíes'),

  body('superficie')
    .not().exists().withMessage('El servidor calcula la superficie automáticamente, no la envíes')
];

export const validarId = [
  param('id')
    .isInt({ gt: 0 }).withMessage('El ID debe ser un número entero y positivo')
    .toInt()
];