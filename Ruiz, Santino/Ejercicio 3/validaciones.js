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
    .exists().withMessage("El ID es obligatorio")
    .isInt({ gt: 0 }).withMessage("El ID debe ser un número entero mayor a 0"),
  manejarErroresValidacion,
];

// Regla reutilizable para validar notas en la escala numérica [1.00 - 10.00]
const reglaNota = (campo) =>
  body(campo)
    .exists().withMessage(`La nota '${campo}' es obligatoria`)
    .isFloat({ min: 1, max: 10 }).withMessage(`La nota '${campo}' debe ser un número dentro de la escala permitida (entre 1.00 y 10.00)`)
    .toFloat();

export const validarMateriaBody = [
  body("nombre")
    .exists().withMessage("El nombre de la materia es obligatorio")
    .bail()
    .trim()
    .notEmpty().withMessage("El nombre de la materia no puede estar vacío")
    .isLength({ min: 2, max: 150 }).withMessage("El nombre de la materia debe tener entre 2 y 150 caracteres"),
  manejarErroresValidacion,
];

export const validarCalificacionBody = [
  body("alumno")
    .exists().withMessage("El nombre del alumno es obligatorio")
    .bail()
    .trim()
    .notEmpty().withMessage("El nombre del alumno no puede estar vacío ni contener solo espacios")
    .isString().withMessage("El nombre del alumno debe ser una cadena de texto")
    .isLength({ min: 2, max: 255 }).withMessage("El nombre del alumno debe tener entre 2 y 255 caracteres"),
  body("materia_id")
    .exists().withMessage("El ID de la materia es obligatorio")
    .isInt({ gt: 0 }).withMessage("El ID de la materia debe ser un entero válido mayor a 0"),
  reglaNota("nota1"),
  reglaNota("nota2"),
  reglaNota("nota3"),
  manejarErroresValidacion,
];

export const validarConsultaCalificaciones = [
  query("materia_id")
    .optional()
    .isInt({ gt: 0 }).withMessage("El filtro materia_id debe ser un entero positivo"),
  query("alumno")
    .optional()
    .trim()
    .notEmpty().withMessage("El filtro de alumno no puede estar vacío"),
  manejarErroresValidacion,
];