import { body, param, query, validationResult } from "express-validator";

// Valida que el id de la URL sea un entero positivo
export const validarId = param("id")
  .isInt({ min: 1 })
  .withMessage("El id debe ser un número entero mayor a 0");

// Valida los filtros opcionales del listado
export const validarFiltros = [
  query("superficieMin")
    .optional()
    .isFloat({ gt: 0 })
    .withMessage("superficieMin debe ser un número mayor a 0"),
  query("superficieMax")
    .optional()
    .isFloat({ gt: 0 })
    .withMessage("superficieMax debe ser un número mayor a 0"),
];

// Valida el body al crear o modificar un rectángulo
export const validarRectangulo = [
  body("lado1")
    .exists()
    .withMessage("lado1 es obligatorio")
    .isFloat({ gt: 0 })
    .withMessage("lado1 debe ser un número mayor a 0"),
  body("lado2")
    .exists()
    .withMessage("lado2 es obligatorio")
    .isFloat({ gt: 0 })
    .withMessage("lado2 debe ser un número mayor a 0"),
  body("perimetro")
    .not()
    .exists()
    .withMessage("El perímetro lo calcula el servidor, no debe enviarse"),
  body("superficie")
    .not()
    .exists()
    .withMessage("La superficie la calcula el servidor, no debe enviarse"),
];

// Middleware que corta la petición si alguna validación falló
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