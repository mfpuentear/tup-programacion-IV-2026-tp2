import { body, param, query, validationResult } from "express-validator";

// Escala documentada: notas de 0 a 10 inclusive
const ESCALA = { min: 0, max: 10 };

// Validacion de id en params
export const validarId = param("id").isInt({ min: 1 });

// Validacion de filtros del listado de calificaciones
export const validarFiltrosCalificaciones = [
  query("materiaId").isInt({ min: 1 }).optional(),
  query("alumno").isString().trim().isLength({ min: 1, max: 100 }).optional(),
];

// Validacion de materia (body)
export const validarMateria = [
  body("nombre")
    .isString()
    .withMessage("nombre debe ser un texto")
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("nombre debe tener entre 1 y 100 caracteres"),
];

// Reglas comunes de alumno y materiaId
const reglasAlumnoMateria = [
  body("alumno")
    .isString()
    .withMessage("alumno debe ser un texto")
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("alumno debe tener entre 1 y 100 caracteres"),
  body("materiaId")
    .isInt({ min: 1 })
    .withMessage("materiaId debe ser un numero positivo"),
];

// Las tres notas obligatorias, numericas y dentro de la escala 0 a 10
const reglasNotas = [
  body("nota1").isFloat(ESCALA).withMessage("nota1 debe ser un numero entre 0 y 10"),
  body("nota2").isFloat(ESCALA).withMessage("nota2 debe ser un numero entre 0 y 10"),
  body("nota3").isFloat(ESCALA).withMessage("nota3 debe ser un numero entre 0 y 10"),
];

// Validacion completa para crear una calificacion
export const validarCalificacionNueva = [...reglasAlumnoMateria, ...reglasNotas];

// Validacion completa para modificar una calificacion
export const validarCalificacionCompleta = [...reglasAlumnoMateria, ...reglasNotas];

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