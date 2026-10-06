import { body, param, query, validationResult } from "express-validator";
import { db } from "./db.js";

// Escala de notas: de 1 a 10, con hasta 2 decimales
const NOTA_MINIMA = 1;
const NOTA_MAXIMA = 10;

export const validarId = param("id")
  .isInt({ min: 1 })
  .withMessage("El id debe ser un numero entero mayor a 0");

// Validacion de filtros de calificaciones
export const validarFiltrosCalificaciones = [
  query("materiaId")
    .isInt({ min: 1 })
    .withMessage("materiaId debe ser un numero entero mayor a 0")
    .optional(),
  query("alumno")
    .isAlpha("es-ES", { ignore: " " })
    .withMessage("alumno solo admite letras y espacios")
    .optional(),
];

// Validacion del nombre de alumno en la ruta /alumnos/:nombre/calificaciones
export const validarNombreAlumno = param("nombre")
  .isAlpha("es-ES", { ignore: " " })
  .withMessage("El nombre del alumno solo admite letras y espacios");

// Validacion de materia
export const validarMateria = [
  body("nombre")
    .isString()
    .withMessage("El nombre es obligatorio y debe ser un texto")
    .bail()
    .trim()
    .customSanitizer((nombre) => nombre.replace(/\s+/g, " "))
    .isAlpha("es-ES", { ignore: " " })
    .withMessage("El nombre solo admite letras y espacios")
    .isLength({ min: 1, max: 100 })
    .withMessage("El nombre debe tener entre 1 y 100 caracteres")
    .bail()
    .custom(async (nombre, { req }) => {
      // Al modificar, se excluye la propia materia de la comparacion
      const id = Number(req.params.id ?? 0);

      const [materias] = await db.execute(
        "SELECT id FROM materias WHERE nombre=? AND id<>?",
        [nombre, id],
      );

      if (materias.length > 0) {
        throw new Error("Ya existe una materia con ese nombre");
      }
    }),
];

// Validacion de calificacion
export const validarCalificacion = [
  body("alumno")
    .isString()
    .withMessage("El nombre del alumno es obligatorio y debe ser un texto")
    .bail()
    .trim()
    .customSanitizer((alumno) => alumno.replace(/\s+/g, " "))
    .isAlpha("es-ES", { ignore: " " })
    .withMessage("El nombre del alumno solo admite letras y espacios")
    .isLength({ min: 2, max: 100 })
    .withMessage("El nombre del alumno debe tener entre 2 y 100 caracteres"),
  body("materiaId")
    .isInt({ min: 1 })
    .withMessage("materiaId debe ser un numero entero mayor a 0")
    .bail()
    // Verificar que la materia exista
    .custom(async (materiaId) => {
      const [materias] = await db.execute(
        "SELECT id FROM materias WHERE id=?",
        [Number(materiaId)],
      );

      if (materias.length === 0) {
        throw new Error("La materia no existe");
      }
    })
    .bail()
    // Verificar que no exista otro registro del alumno en la misma materia
    .custom(async (materiaId, { req }) => {
      const { alumno } = req.body;
      if (typeof alumno !== "string") return;

      // Al modificar, se excluye el propio registro de la comparacion
      const id = Number(req.params.id ?? 0);

      const [calificaciones] = await db.execute(
        "SELECT id FROM calificaciones WHERE alumno=? AND materia_id=? AND id<>?",
        [alumno, Number(materiaId), id],
      );

      if (calificaciones.length > 0) {
        throw new Error("El alumno ya tiene un registro en esa materia");
      }
    }),
  body("notas")
    .isArray({ min: 3, max: 3 })
    .withMessage("Se deben enviar exactamente tres notas"),
  body("notas.*")
    .isFloat({ min: NOTA_MINIMA, max: NOTA_MAXIMA })
    .withMessage(`Cada nota debe ser un numero entre ${NOTA_MINIMA} y ${NOTA_MAXIMA}`)
    .bail()
    .isDecimal({ decimal_digits: "0,2" })
    .withMessage("Cada nota admite como maximo 2 decimales"),
];

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