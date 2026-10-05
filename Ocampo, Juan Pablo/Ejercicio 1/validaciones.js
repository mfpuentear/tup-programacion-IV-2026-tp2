import { body, param, validationResult } from "express-validator";

// Validacion de rectangulo para crear o modificar
export const validarRectangulo = [
  body("ladoA")
  .notEmpty().withMessage("se necesita el ladoA")
    .isFloat({ min: 1 })
    .withMessage("ladoA debe ser un numero mayor a 0"),
  body("ladoB")
    .notEmpty().withMessage("se necesita el ladoB")
    .isFloat({ min: 1 })
    .withMessage("ladoB debe ser un numero mayor a 0"),
];

// Validacion de ID 
export const validarId = param("id")
  .isInt({ min: 1 })
  .withMessage("El ID debe ser un numero entero positivo");

// Middleware para verificar validaciones
export const verificarValidaciones = (req, res, next) => {
  const resultadoValidacion = validationResult(req);
  if (!resultadoValidacion.isEmpty()) {
    return res.status(400).json({
      mensaje: "Parametros no validos",
      errores: resultadoValidacion.array(),
    });
  }
  next();
};
