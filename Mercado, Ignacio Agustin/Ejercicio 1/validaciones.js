import { body, param, validationResult } from "express-validator";

// Validacion del ID en parametros de URL
export const validarId = param("id")
  .isInt({ min: 1 })
  .withMessage("El ID debe ser un número entero mayor a 0");

// Validacion del Body para Lados
export const validarRectangulo = [
  body("lado1")
    .exists({ checkNull: true })
    .withMessage("El lado1 es obligatorio")
    .isFloat({ gt: 0 })
    .withMessage("El lado1 debe ser un número mayor que 0"),
  body("lado2")
    .exists({ checkNull: true })
    .withMessage("El lado2 es obligatorio")
    .isFloat({ gt: 0 })
    .withMessage("El lado2 debe ser un número mayor que 0"),
];

// Middleware para verificar resultado de express-validator
export const verificarValidaciones = (req, res, next) => {
  const resultadoValidacion = validationResult(req);
  if (!resultadoValidacion.isEmpty()) {
    return res.status(400).json({
      mensaje: "Parámetros no válidos",
      errores: resultadoValidacion.array(),
    });
  }
  next();
};