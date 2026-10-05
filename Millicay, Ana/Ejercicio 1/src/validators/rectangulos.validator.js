const { body, param, query, validationResult } = require('express-validator');

const validar = (req, res, next) => {
  const errores = validationResult(req);
  if (!errores.isEmpty()) {
    return res.status(400).json({ errores: errores.array() });
  }
  next();
};

const lado = (campo) =>
  body(campo)
    .notEmpty().withMessage(`${campo} es obligatorio`).bail()
    .matches(/^\d+(\.\d{1,2})?$/).withMessage(`${campo} debe ser un número con hasta 2 decimales`).bail()
    .isFloat({ gt: 0, max: 100000 }).withMessage(`${campo} debe ser mayor que 0 y no superar 100000`).bail()
    .toFloat();

const idParam = param('id')
  .isInt({ min: 1 }).withMessage('El id debe ser un entero positivo')
  .toInt();

// El cliente NO puede enviar valores calculados
const sinCalculados = body(['perimetro', 'superficie'])
  .not().exists()
  .withMessage('El perímetro y la superficie se calculan en el servidor, no deben enviarse');

const validarLados = [sinCalculados, lado('ladoA'), lado('ladoB'), validar];

module.exports = {
  crear: validarLados,
  actualizar: [idParam, ...validarLados],
  porId: [idParam, validar],
  listar: [
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit debe estar entre 1 y 100').toInt(),
    query('offset').optional().isInt({ min: 0 }).withMessage('offset debe ser un entero >= 0').toInt(),
    validar,
  ],
};