const { body, param, validationResult } = require('express-validator');

const validar = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errores: errors.array().map((e) => ({ campo: e.path, mensaje: e.msg })) });
  }
  next();
};

const idParam = param('id').isInt({ min: 1 }).withMessage('El id debe ser un entero positivo').toInt();

const nombreBody = body('nombre')
  .exists({ values: 'falsy' }).withMessage('El nombre es obligatorio').bail()
  .isString().withMessage('El nombre debe ser texto').bail()
  .trim()
  .customSanitizer((v) => v.replace(/\s+/g, ' '))
  .isLength({ min: 2, max: 100 }).withMessage('El nombre debe tener entre 2 y 100 caracteres');

module.exports = {
  validarId: [idParam, validar],
  validarCuerpo: [nombreBody, validar],
  validarIdYCuerpo: [idParam, nombreBody, validar],
  validar,
};
