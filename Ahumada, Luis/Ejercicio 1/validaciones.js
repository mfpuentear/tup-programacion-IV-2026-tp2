import { body, param, validationResult } from "express-validator";


//Validar id
export const validarId = [
  param("id")
    .isInt({ min: 1 })
    .withMessage("El id debe ser un número entero mayor a 0"),
];


//Validar datos del rectángulo
export const validarRectangulo = [
  body("base")
    .isFloat({ gt: 0 })
    .withMessage("La base debe ser un número mayor a 0"),

  body("altura")
    .isFloat({ gt: 0 })
    .withMessage("La altura debe ser un número mayor a 0"),
];


//Verificar errores de validación
export const verificarValidaciones = (req, res, next) => {

  const errores = validationResult(req);

  if (!errores.isEmpty()) {
    return res.status(400).send({
      errores: errores.array(),
    });
  }

  next();
};