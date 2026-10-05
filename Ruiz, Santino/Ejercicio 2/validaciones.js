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
    .isInt({ gt: 0 }).withMessage("El ID debe ser un número entero mayor a 0"),
  manejarErroresValidacion,
];

export const validarCrearTareaBody = [
  body("nombre")
    .exists().withMessage("El nombre de la tarea es obligatorio")
    .bail()
    .trim()
    .notEmpty().withMessage("El nombre no puede estar vacío ni contener solo espacios")
    .isString().withMessage("El nombre debe ser una cadena de texto")
    .isLength({ min: 2, max: 255 }).withMessage("El nombre debe tener entre 2 y 255 caracteres"),
  body("completada")
    .optional()
    .isBoolean().withMessage("El estado completada debe ser un valor booleano (true o false)")
    .toBoolean(),
  manejarErroresValidacion,
];

export const validarActualizarTareaBody = [
  body("nombre")
    .exists().withMessage("El nombre de la tarea es obligatorio")
    .bail()
    .trim()
    .notEmpty().withMessage("El nombre no puede estar vacío ni contener solo espacios")
    .isString().withMessage("El nombre debe ser una cadena de texto")
    .isLength({ min: 2, max: 255 }).withMessage("El nombre debe tener entre 2 y 255 caracteres"),
  body("completada")
    .exists().withMessage("El estado completada es obligatorio")
    .isBoolean().withMessage("El estado completada debe ser un valor booleano (true o false)")
    .toBoolean(),
  manejarErroresValidacion,
];

export const validarConsultaQuery = [
  query("completada")
    .optional()
    .isIn(["true", "false", "1", "0"]).withMessage("El filtro completada debe ser un estado admitido (true o false)"),
  manejarErroresValidacion,
];