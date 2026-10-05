import { body, param, query, validationResult } from "express-validator";

export const validarId = param("id").isInt({ min: 1 }).withMessage("id debe ser un entero mayor a 0");

export const validarNombre = [
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
];

export const validarFiltrosCalificaciones = [
  query("alumnoId").optional().isInt({ min: 1 }).withMessage("alumnoId debe ser un entero mayor a 0"),
  query("materiaId").optional().isInt({ min: 1 }).withMessage("materiaId debe ser un entero mayor a 0"),
];

export const validarCalificacion = [
  body("alumnoId")
    .exists()
    .withMessage("alumnoId es obligatorio")
    .isInt({ min: 1 })
    .withMessage("alumnoId debe ser un entero mayor a 0"),
  body("materiaId")
    .exists()
    .withMessage("materiaId es obligatorio")
    .isInt({ min: 1 })
    .withMessage("materiaId debe ser un entero mayor a 0"),
  body("notas")
    .exists()
    .withMessage("notas es obligatorio")
    .isArray({ min: 3, max: 3 })
    .withMessage("notas debe tener exactamente 3 valores"),
  body("notas.*")
    .isFloat({ min: 0, max: 10 })
    .withMessage("cada nota debe ser un numero entre 0 y 10"),
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
