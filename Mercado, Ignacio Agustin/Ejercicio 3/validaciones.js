import { body, param, validationResult } from "express-validator";
import { db } from "./db.js";

// Escala de calificaciones definida: Números flotantes de 1.00 a 10.00
const NOTA_MINIMA = 1.0;
const NOTA_MAXIMA = 10.0;

export const normalizarTexto = (texto) => texto.trim().replace(/\s+/g, " ");

export const validarId = param("id")
  .isInt({ min: 1 })
  .withMessage("El ID debe ser un número entero positivo");

export const validarCrearMateria = [
  body("nombre")
    .exists({ checkNull: true })
    .withMessage("El nombre de la materia es obligatorio")
    .bail()
    .isString()
    .trim()
    .notEmpty()
    .withMessage("El nombre de la materia no puede estar vacío")
    .bail()
    .customSanitizer(normalizarTexto)
    .custom(async (nombre) => {
      const [filas] = await db.execute(
        "SELECT id FROM materias WHERE LOWER(nombre) = LOWER(?)",
        [nombre]
      );
      if (filas.length > 0) {
        throw new Error(`La materia '${nombre}' ya se encuentra registrada`);
      }
      return true;
    }),
];

export const validarCrearCalificacion = [
  body("alumno")
    .exists({ checkNull: true })
    .withMessage("El nombre del alumno es obligatorio")
    .bail()
    .isString()
    .trim()
    .notEmpty()
    .withMessage("El nombre del alumno no puede estar vacío")
    .bail()
    .customSanitizer(normalizarTexto),

  body("materia_id")
    .exists({ checkNull: true })
    .withMessage("El id de la materia es obligatorio")
    .bail()
    .isInt({ min: 1 })
    .withMessage("El id de la materia debe ser un entero positivo")
    .bail()
    .custom(async (materiaId) => {
      const [filas] = await db.execute("SELECT id FROM materias WHERE id = ?", [materiaId]);
      if (filas.length === 0) {
        throw new Error(`La materia con ID ${materiaId} no existe`);
      }
      return true;
    }),

  // Validar exactamente las 3 notas numéricas
  ...["nota1", "nota2", "nota3"].map((nota) =>
    body(nota)
      .exists({ checkNull: true })
      .withMessage(`La ${nota} es obligatoria`)
      .bail()
      .isFloat({ min: NOTA_MINIMA, max: NOTA_MAXIMA })
      .withMessage(`La ${nota} debe ser un valor numérico entre ${NOTA_MINIMA} y ${NOTA_MAXIMA}`)
  ),

  // Validar Unicidad de (Alumno + Materia)
  body("alumno").custom(async (alumno, { req }) => {
    const materiaId = req.body.materia_id;
    if (alumno && materiaId) {
      const [filas] = await db.execute(
        "SELECT id FROM calificaciones WHERE LOWER(alumno) = LOWER(?) AND materia_id = ?",
        [alumno, materiaId]
      );
      if (filas.length > 0) {
        throw new Error(`El alumno '${alumno}' ya tiene un registro de calificaciones cargado para esta materia`);
      }
    }
    return true;
  }),
];

export const validarActualizarCalificacion = [
  validarId,
  body("alumno")
    .optional()
    .isString()
    .trim()
    .notEmpty()
    .withMessage("El nombre del alumno no puede estar vacío")
    .bail()
    .customSanitizer(normalizarTexto),

  body("materia_id")
    .optional()
    .isInt({ min: 1 })
    .withMessage("El id de la materia debe ser un entero positivo")
    .bail()
    .custom(async (materiaId) => {
      const [filas] = await db.execute("SELECT id FROM materias WHERE id = ?", [materiaId]);
      if (filas.length === 0) {
        throw new Error(`La materia con ID ${materiaId} no existe`);
      }
      return true;
    }),

  ...["nota1", "nota2", "nota3"].map((nota) =>
    body(nota)
      .optional()
      .isFloat({ min: NOTA_MINIMA, max: NOTA_MAXIMA })
      .withMessage(`La ${nota} debe ser un valor numérico entre ${NOTA_MINIMA} y ${NOTA_MAXIMA}`)
  ),

  // Validar Unicidad de (Alumno + Materia) excluyendo el id actual
  body("alumno").custom(async (alumno, { req }) => {
    const id = req.params.id;
    
    // Obtener valores actuales de la BD para combinar con los datos enviados
    const [actual] = await db.execute("SELECT alumno, materia_id FROM calificaciones WHERE id = ?", [id]);
    if (actual.length === 0) return true; // El 404 lo manejará el controlador

    const alumnoEvaluar = alumno || actual[0].alumno;
    const materiaEvaluar = req.body.materia_id || actual[0].materia_id;

    const [filas] = await db.execute(
      "SELECT id FROM calificaciones WHERE LOWER(alumno) = LOWER(?) AND materia_id = ? AND id != ?",
      [alumnoEvaluar, materiaEvaluar, id]
    );

    if (filas.length > 0) {
      throw new Error(`Ya existe otro registro para el alumno '${alumnoEvaluar}' en esa materia`);
    }
    return true;
  }),
];

export const verificarValidaciones = (req, res, next) => {
  const errores = validationResult(req);
  if (!errores.isEmpty()) {
    return res.status(400).json({
      mensaje: "Parámetros o datos no válidos",
      errores: errores.array(),
    });
  }
  next();
};