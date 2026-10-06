import { body, param, query, validationResult } from "express-validator";

// Validacion de filtros de rectangulos
export const validarFiltrosRectangulos = [
  query("superficieMin")
    .isFloat({ gt: 0 })
    .withMessage("superficieMin debe ser un numero mayor a 0")
    .optional(),
  query("superficieMax")
    .isFloat({ gt: 0 })
    .withMessage("superficieMax debe ser un numero mayor a 0")
    .optional(),
];

export const validarId = param("id")
  .isInt({ min: 1 })
  .withMessage("El id debe ser un numero entero mayor a 0");

// Validacion de rectangulo
export const validarRectangulo = [
  body("base")
    .exists()
    .withMessage("La base es obligatoria")
    .bail()
    .isFloat({ gt: 0, max: 1000000 })
    .withMessage("La base debe ser un numero mayor a 0 (maximo 1000000)")
    .bail()
    .isDecimal({ decimal_digits: "0,2" })
    .withMessage("La base admite como maximo 2 decimales"),
  body("altura")
    .exists()
    .withMessage("La altura es obligatoria")
    .bail()
    .isFloat({ gt: 0, max: 1000000 })
    .withMessage("La altura debe ser un numero mayor a 0 (maximo 1000000)")
    .bail()
    .isDecimal({ decimal_digits: "0,2" })
    .withMessage("La altura admite como maximo 2 decimales"),
  // El perimetro y la superficie los calcula el servidor
  body("perimetro")
    .not()
    .exists()
    .withMessage("El perimetro lo calcula el servidor, no debe enviarse"),
  body("superficie")
    .not()
    .exists()
    .withMessage("La superficie la calcula el servidor, no debe enviarse"),
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
