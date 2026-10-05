import { body, param, query, validationResult } from "express-validator";

// Validacion de filtros del listado
export const validarFiltrosRectangulos = [
  query("tipo").isIn(["cuadrado", "rectangulo"]).optional(),
  query("perimetroMin").isFloat({ gt: 0 }).optional(),
  query("perimetroMax").isFloat({ gt: 0 }).optional(),
];

// Validacion de id en params
export const validarId = param("id").isInt({ min: 1 });

// Validacion de lados en body: obligatorios y mayores a cero
export const validarRectangulo = [
  body("ladoA")
    .isFloat({ gt: 0 })
    .withMessage("ladoA debe ser un numero mayor a 0"),
  body("ladoB")
    .isFloat({ gt: 0 })
    .withMessage("ladoB debe ser un numero mayor a 0"),
];

// Middleware para verificar validaciones
export const verificarValidaciones = (req, res, next) => {
  const resultadoValidacion = validationResult(req);
  if (!resultadoValidacion.isEmpty()) {
    return res.status(400).send({
      mensaje: "Parametros no validos",
      errores: resultadoValidacion.array(),
    });
  }
  next();
};