import { body, param, validationResult } from "express-validator";
import { db } from "./db.js";

// Validacion de id
export const validarId = param("id").isInt({ min: 1 });

// Validacion de materia al crear
export const validarMateria = [
  body("nombre")
    .trim()
    .notEmpty()
    .withMessage("El nombre de la materia es obligatorio")
    .isLength({ max: 255 })
    .withMessage("El nombre debe tener hasta 255 caracteres")
    .custom(async (nombre) => {
      const [materias] = await db.execute(
        "SELECT id FROM materias WHERE LOWER(TRIM(nombre)) = LOWER(TRIM(?))",
        [nombre],
      );
      if (materias.length > 0) {
        throw new Error("Ya existe una materia con ese nombre");
      }
    }),
];

// Validacion de las 3 notas (escala 0 a 10)
const validarNotas = [
  body("nota1")
    .isFloat({ min: 0, max: 10 })
    .withMessage("nota1 debe ser un número entre 0 y 10"),
  body("nota2")
    .isFloat({ min: 0, max: 10 })
    .withMessage("nota2 debe ser un número entre 0 y 10"),
  body("nota3")
    .isFloat({ min: 0, max: 10 })
    .withMessage("nota3 debe ser un número entre 0 y 10"),
];

// Validacion de calificacion al crear
export const validarCalificacion = [
  body("alumno")
    .trim()
    .notEmpty()
    .withMessage("El nombre del alumno es obligatorio")
    .isLength({ max: 255 })
    .withMessage("El nombre debe tener hasta 255 caracteres"),
  body("materia_id")
    .isInt({ min: 1 })
    .withMessage("materia_id debe ser un entero válido")
    .custom(async (materiaId) => {
      const [materias] = await db.execute(
        "SELECT id FROM materias WHERE id = ?",
        [materiaId],
      );
      if (materias.length === 0) {
        throw new Error("La materia indicada no existe");
      }
    }),
  ...validarNotas,
  body("alumno").custom(async (alumno, { req }) => {
    const [existentes] = await db.execute(
      `SELECT id FROM calificaciones
       WHERE LOWER(TRIM(alumno)) = LOWER(TRIM(?)) AND materia_id = ?`,
      [alumno, req.body.materia_id],
    );
    if (existentes.length > 0) {
      throw new Error("Ya existe una calificación para este alumno en esta materia");
    }
  }),
];

// Validacion de calificacion al modificar (solo las notas, alumno y materia no cambian)
export const validarCalificacionUpdate = [...validarNotas];

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