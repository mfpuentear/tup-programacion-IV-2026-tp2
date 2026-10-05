import { body, param, query, validationResult } from "express-validator";

const manejarErroresValidacion = (req, res, next) => {
  const errores = validationResult(req);
  if (!errores.isEmpty()) {
    return res.status(400).json({
      error: "Error de validación en la solicitud",
      detalles: errores.array().map((e) => ({ campo: e.path, mensaje: e.msg })),
    });
  }
  next();
};

export const validarParamId = [
  param("id")
    .exists().withMessage("El parámetro ID es obligatorio")
    .isInt({ gt: 0 }).withMessage("El ID debe ser un entero mayor a 0"),
  manejarErroresValidacion,
];

export const validarRectanguloBody = [
  body("lado1")
    .exists().withMessage("El valor de lado1 es obligatorio")
    .isFloat({ gt: 0 }).withMessage("El lado1 debe ser mayor a 0"),
  body("lado2")
    .exists().withMessage("El valor de lado2 es obligatorio")
    .isFloat({ gt: 0 }).withMessage("El lado2 debe ser mayor a 0"),
  manejarErroresValidacion,
];

export const validarConsultaQuery = [
  query("limite")
    .optional()
    .isInt({ gt: 0 }).withMessage("El límite debe ser un entero positivo"),
  query("pagina")
    .optional()
    .isInt({ gt: 0 }).withMessage("La página debe ser un entero positivo"),
  manejarErroresValidacion,
];