import { body, param, query, validationResult } from "express-validator";

export const validarId = param("id").isInt({ min: 1 }).withMessage("id debe ser un entero mayor a 0");

export const validarFiltroEstado = [
  query("estado").optional().isIn(["completada", "pendiente"]).withMessage("estado debe ser completada o pendiente"),
];

export const validarTarea = [
  body("nombre")
    .exists()
    .withMessage("nombre es obligatorio")
    .isString()
    .withMessage("nombre debe ser texto")
    .trim()
    .isLength({ min: 1, max: 80 })
    .withMessage("nombre debe tener entre 1 y 80 caracteres")
    .isAlpha("es-ES", { ignore: " " })
    .withMessage("nombre solo admite letras y espacios"),
  body("completada").optional().isBoolean().withMessage("completada debe ser true o false"),
];

export const validarTareaPut = [
  body("nombre")
    .exists()
    .withMessage("nombre es obligatorio")
    .isString()
    .withMessage("nombre debe ser texto")
    .trim()
    .isLength({ min: 1, max: 80 })
    .withMessage("nombre debe tener entre 1 y 80 caracteres")
    .isAlpha("es-ES", { ignore: " " })
    .withMessage("nombre solo admite letras y espacios"),
  body("completada")
    .exists()
    .withMessage("completada es obligatorio al modificar")
    .isBoolean()
    .withMessage("completada debe ser true o false"),
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
