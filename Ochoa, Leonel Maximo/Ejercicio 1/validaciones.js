import { body, param, query, validationResult } from "express-validator";

export const validarId = param("id").isInt({ min: 1 }).withMessage("id debe ser un entero mayor a 0");

export const validarFiltrosRectangulos = [
  query("esCuadrado")
    .optional()
    .isIn(["true", "false"])
    .withMessage("esCuadrado debe ser true o false"),
];

// Solo se aceptan los dos lados. Perimetro y superficie no entran por el body.
export const validarLados = [
  body("ladoA")
    .exists()
    .withMessage("ladoA es obligatorio")
    .isFloat({ gt: 0 })
    .withMessage("ladoA debe ser un numero mayor a 0"),
  body("ladoB")
    .exists()
    .withMessage("ladoB es obligatorio")
    .isFloat({ gt: 0 })
    .withMessage("ladoB debe ser un numero mayor a 0"),
  body("perimetro")
    .not()
    .exists()
    .withMessage("perimetro no se acepta; se calcula en el servidor"),
  body("superficie")
    .not()
    .exists()
    .withMessage("superficie no se acepta; se calcula en el servidor"),
];

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
