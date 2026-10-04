import { body, param, validationResult } from "express-validator";

// Validacion de id
export const validarId = param("id").isInt({ min: 1 });

// Validacion de rectangulo
export const validarRectangulo = [
  body("lado1")
    .isFloat({ gt: 0 })
    .withMessage("lado1 debe ser un numero mayor a 0"),
  body("lado2")
    .isFloat({ gt: 0 })
    .withMessage("lado2 debe ser un numero mayor a 0"),
];

// Middleware para verificar validaciones
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
