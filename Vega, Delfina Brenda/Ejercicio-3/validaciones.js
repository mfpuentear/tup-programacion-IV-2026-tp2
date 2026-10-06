import { body, param, query, validationResult } from "express-validator";
import { db } from "./db.js";

export const MENSAJE_MATERIA_DUPLICADA = "Ya existe una materia con ese nombre";
export const MENSAJE_CALIFICACION_DUPLICADA =
  "Ya existe un registro para ese alumno en esa materia";

    const CONFLICTOS = [MENSAJE_MATERIA_DUPLICADA, MENSAJE_CALIFICACION_DUPLICADA];

// Escala de notas de 0 a 10 (inclusive), con hasta 2 decimales
const NOTA_MIN = 0;
const NOTA_MAX = 10;

// Criterio de comparacion de nombres: se quitan los espacios al inicio, al final
// y los repetidos; la base compara sin distinguir mayusculas ni tildes.
const normalizarTexto = (texto) => texto.trim().replace(/\s+/g, " ");

export const validarId = param("id")
  .isInt({ min: 1 })
  .withMessage("id debe ser un entero positivo");

// Validacion de filtros del listado de calificaciones

export const validarFiltrosCalificaciones = [
  query("alumno")
    .optional()
    .isAlpha("es-ES", { ignore: " '-" })
    .withMessage("alumno solo admite letras, espacios, apóstrofes y guiones"),
  query("materiaId")
    .optional()
    .isInt({ min: 1 })
    .withMessage("materiaId debe ser un entero positivo"),
];

// Validacion de materia
export const validarMateria = body("nombre")
  .exists({ values: "null" })
  .withMessage("nombre es obligatorio")
  .bail()
  .isString()
  .withMessage("nombre debe ser un texto")
  .bail()
  .customSanitizer(normalizarTexto)
  .notEmpty()
  .withMessage("nombre no puede estar vacio")
  .bail()
  .isLength({ max: 100 })
  .withMessage("nombre admite hasta 100 caracteres")
  .bail()
  .isAlphanumeric("es-ES", { ignore: " " })
  .withMessage("nombre solo admite letras, numeros y espacios")
  .bail()
  .custom(async (nombre, { req }) => {

    // En PUT se ignora la propia materia; en POST no hay id (se usa 0)
    const idActual = Number(req.params.id) || 0;
    const [filas] = await db.execute(
      "SELECT id FROM materias WHERE nombre = ? AND id <> ?",
      [nombre, idActual],
    );
    if (filas.length > 0) {
      throw new Error(MENSAJE_MATERIA_DUPLICADA);
    }
  });

const validarAlumno = body("alumno")
  .exists({ values: "null" })
  .withMessage("alumno es obligatorio")
  .bail()
  .isString()
  .withMessage("alumno debe ser un texto")
  .bail()
  .customSanitizer(normalizarTexto)
  .notEmpty()
  .withMessage("alumno no puede estar vacio")
  .bail()
  .isLength({ max: 100 })
  .withMessage("alumno admite hasta 100 caracteres")
  .bail()
  .isAlpha("es-ES", { ignore: " '-" })
  .withMessage("alumno solo admite letras, espacios, apóstrofes y guiones")
  .bail()
  .custom(async (alumno, { req }) => {
    
    // Si materiaId no es valido, ese error lo informa la validacion de materiaId
    const materiaId = Number(req.body.materiaId);
    if (!Number.isInteger(materiaId) || materiaId < 1) {
      return true;
    }
    // En PUT se ignora el propio registro; en POST no hay id (se usa 0)
    const idActual = Number(req.params.id) || 0;
    const [filas] = await db.execute(
      "SELECT id FROM calificaciones WHERE alumno = ? AND materia_id = ? AND id <> ?",
      [alumno, materiaId, idActual],
    );
    if (filas.length > 0) {
      throw new Error(MENSAJE_CALIFICACION_DUPLICADA);
    }
  });

const validarMateriaId = body("materiaId")
  .exists({ values: "null" })
  .withMessage("materiaId es obligatorio")
  .bail()
  .isInt({ min: 1 })
  .withMessage("materiaId debe ser un entero positivo")
  .bail()
  .toInt()
  .custom(async (materiaId) => {
    const [filas] = await db.execute("SELECT id FROM materias WHERE id = ?", [
      materiaId,
    ]);
    if (filas.length === 0) {
      throw new Error("La materia indicada no existe");
    }
  });

const validarNotas = [
  body("notas")
    .exists({ values: "null" })
    .withMessage("notas es obligatorio")
    .bail()
    .isArray({ min: 3, max: 3 })
    .withMessage("notas debe ser una lista de exactamente 3 valores"),
  body("notas.*")
    .custom((nota) => typeof nota === "number")
    .withMessage("cada nota debe ser un número")
    .bail()
    .isFloat({ min: NOTA_MIN, max: NOTA_MAX })
    .withMessage(`cada nota debe estar entre ${NOTA_MIN} y ${NOTA_MAX}`)
    .bail()
    .isDecimal({ decimal_digits: "0,2" })
    .withMessage("cada nota admite como máximo 2 decimales"),
];

// Validacion de calificacion (crear y modificar)
export const validarCalificacion = [
  validarAlumno,
  validarMateriaId,
  ...validarNotas,
];

// Middleware para verificar validaciones
export const verificarValidaciones = (req, res, next) => {
  const resultadoValidacion = validationResult(req);
  if (!resultadoValidacion.isEmpty()) {
    const errores = resultadoValidacion.array();
    const soloConflicto = errores.every((e) => CONFLICTOS.includes(e.msg));
    return res.status(soloConflicto ? 409 : 400).json({
      mensaje: soloConflicto ? errores[0].msg : "Parámetros no válidos",
      errores,
    });
  }
  next();
};