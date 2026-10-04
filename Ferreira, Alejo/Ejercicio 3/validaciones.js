import { body, param, query, validationResult } from "express-validator";
import { db } from "./db.js";

// Reemplaza varios espacios seguidos por uno solo
const limpiarEspacios = (texto) => texto.replace(/\s+/g, " ");

// Valida que el id de la URL sea un entero positivo
export const validarId = param("id")
  .isInt({ min: 1 })
  .withMessage("El id debe ser un número entero mayor a 0");

// ========== MATERIAS ==========

export const validarMateria = [
  body("nombre")
    .exists()
    .withMessage("El nombre es obligatorio")
    .bail()
    .isString()
    .withMessage("El nombre debe ser un texto")
    .bail()
    .trim()
    .customSanitizer(limpiarEspacios)
    .notEmpty()
    .withMessage("El nombre no puede estar vacío")
    .bail()
    .isLength({ max: 100 })
    .withMessage("El nombre puede tener hasta 100 caracteres")
    .bail()
    .custom(async (nombre, { req }) => {
      const id = Number(req.params.id) || 0;
      const [materias] = await db.execute(
        "SELECT id FROM materias WHERE nombre = ? AND id <> ?",
        [nombre, id],
      );
      if (materias.length > 0) {
        throw new Error("Ya existe una materia con ese nombre");
      }
    }),
];

// ========== CALIFICACIONES ==========

// Filtros opcionales del listado
export const validarFiltrosCalificaciones = [
  query("alumno")
    .optional()
    .isString()
    .trim()
    .notEmpty()
    .withMessage("El filtro alumno no puede estar vacío"),
  query("materiaId")
    .optional()
    .isInt({ min: 1 })
    .withMessage("materiaId debe ser un número entero mayor a 0"),
];
// Filtro opcional del listado de alumnos
export const validarFiltrosAlumnos = [
  query("nombre")
    .optional()
    .isString()
    .trim()
    .notEmpty()
    .withMessage("El filtro nombre no puede estar vacío"),
];

// Datos de una calificación (al crear y al modificar)
export const validarCalificacion = [
  // Nombre del alumno
  body("alumno")
    .exists()
    .withMessage("El nombre del alumno es obligatorio")
    .bail()
    .isString()
    .withMessage("El nombre del alumno debe ser un texto")
    .bail()
    .trim()
    .customSanitizer(limpiarEspacios)
    .isLength({ min: 2, max: 100 })
    .withMessage("El nombre del alumno debe tener entre 2 y 100 caracteres")
    .bail()
    .matches(/^[\p{L}' ]+$/u)
    .withMessage("El nombre del alumno solo puede contener letras, espacios y apóstrofos"),

  // Materia: debe ser un id válido y existir en la base
  body("materiaId")
    .exists()
    .withMessage("materiaId es obligatorio")
    .bail()
    .isInt({ min: 1 })
    .withMessage("materiaId debe ser un número entero mayor a 0")
    .bail()
    .toInt()
    .custom(async (materiaId) => {
      const [materias] = await db.execute(
        "SELECT id FROM materias WHERE id = ?",
        [materiaId],
      );
      if (materias.length === 0) {
        throw new Error("La materia indicada no existe");
      }
    }),

  // Notas: exactamente tres
  body("notas")
    .exists()
    .withMessage("Las notas son obligatorias")
    .bail()
    .isArray({ min: 3, max: 3 })
    .withMessage("Se deben informar exactamente tres notas"),

  // Cada nota: número entero entre 1 y 10
  body("notas.*")
    .custom((nota) => typeof nota === "number")
    .withMessage("Cada nota debe ser un número")
    .bail()
    .isInt({ min: 1, max: 10 })
    .withMessage("Cada nota debe ser un número entero entre 1 y 10"),

  // Regla de unicidad: un solo registro por alumno y materia
  body("alumno").custom(async (alumno, { req }) => {
    const materiaId = Number(req.body.materiaId);
    // Si alumno o materia ya son inválidos, lo informan las reglas anteriores
    if (typeof alumno !== "string" || !alumno || !Number.isInteger(materiaId)) {
      return;
    }
    const id = Number(req.params.id) || 0;
    const [registros] = await db.execute(
      "SELECT id FROM calificaciones WHERE alumno = ? AND materia_id = ? AND id <> ?",
      [alumno, materiaId, id],
    );
    if (registros.length > 0) {
      throw new Error("El alumno ya tiene un registro en esa materia");
    }
  }),
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