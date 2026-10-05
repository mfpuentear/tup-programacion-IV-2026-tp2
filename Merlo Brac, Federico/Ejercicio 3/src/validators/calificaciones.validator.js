import { body, param, query } from 'express-validator';

/**
 * Validaciones para crear una calificación (POST /api/calificaciones)
 * Exige exactamente 3 notas numéricas dentro de la escala [1.00 - 10.00]
 */
export const createCalificacionValidator = [
  body('alumno')
    .exists({ checkFalsy: true }).withMessage("El campo 'alumno' es obligatorio")
    .isString().withMessage("El campo 'alumno' debe ser una cadena de texto")
    .trim()
    .isLength({ min: 3, max: 100 }).withMessage("El nombre del alumno debe contener entre 3 y 100 caracteres"),

  body('materia_id')
    .exists({ checkFalsy: true }).withMessage("El campo 'materia_id' es obligatorio")
    .isInt({ gt: 0 }).withMessage("El campo 'materia_id' debe ser un identificador entero positivo")
    .toInt(),

  body('nota1')
    .exists({ checkFalsy: false }).withMessage("La 'nota1' es obligatoria (se requieren exactamente 3 notas)")
    .isFloat({ min: 1.0, max: 10.0 }).withMessage("La 'nota1' debe ser un número dentro de la escala oficial de 1.00 a 10.00")
    .toFloat(),

  body('nota2')
    .exists({ checkFalsy: false }).withMessage("La 'nota2' es obligatoria (se requieren exactamente 3 notas)")
    .isFloat({ min: 1.0, max: 10.0 }).withMessage("La 'nota2' debe ser un número dentro de la escala oficial de 1.00 a 10.00")
    .toFloat(),

  body('nota3')
    .exists({ checkFalsy: false }).withMessage("La 'nota3' es obligatoria (se requieren exactamente 3 notas)")
    .isFloat({ min: 1.0, max: 10.0 }).withMessage("La 'nota3' debe ser un número dentro de la escala oficial de 1.00 a 10.00")
    .toFloat()
];

/**
 * Validaciones para modificar una calificación (PUT /api/calificaciones/:id)
 */
export const updateCalificacionValidator = [
  param('id')
    .isInt({ gt: 0 }).withMessage("El parámetro de ruta 'id' debe ser un número entero positivo")
    .toInt(),

  body('alumno')
    .exists({ checkFalsy: true }).withMessage("El campo 'alumno' es obligatorio")
    .isString().withMessage("El campo 'alumno' debe ser una cadena de texto")
    .trim()
    .isLength({ min: 3, max: 100 }).withMessage("El nombre del alumno debe contener entre 3 y 100 caracteres"),

  body('materia_id')
    .exists({ checkFalsy: true }).withMessage("El campo 'materia_id' es obligatorio")
    .isInt({ gt: 0 }).withMessage("El campo 'materia_id' debe ser un identificador entero positivo")
    .toInt(),

  body('nota1')
    .exists({ checkFalsy: false }).withMessage("La 'nota1' es obligatoria")
    .isFloat({ min: 1.0, max: 10.0 }).withMessage("La 'nota1' debe ser un número dentro de la escala oficial de 1.00 a 10.00")
    .toFloat(),

  body('nota2')
    .exists({ checkFalsy: false }).withMessage("La 'nota2' es obligatoria")
    .isFloat({ min: 1.0, max: 10.0 }).withMessage("La 'nota2' debe ser un número dentro de la escala oficial de 1.00 a 10.00")
    .toFloat(),

  body('nota3')
    .exists({ checkFalsy: false }).withMessage("La 'nota3' es obligatoria")
    .isFloat({ min: 1.0, max: 10.0 }).withMessage("La 'nota3' debe ser un número dentro de la escala oficial de 1.00 a 10.00")
    .toFloat()
];

/**
 * Validación para parámetro de ruta ID
 */
export const idParamValidator = [
  param('id')
    .isInt({ gt: 0 }).withMessage("El parámetro de ruta 'id' debe ser un número entero positivo")
    .toInt()
];

/**
 * Validación de parámetros de consulta (query params)
 */
export const queryCalificacionValidator = [
  query('materia_id')
    .optional()
    .isInt({ gt: 0 }).withMessage("El parámetro de consulta 'materia_id' debe ser un entero positivo")
    .toInt(),

  query('alumno')
    .optional()
    .isString().withMessage("El parámetro de consulta 'alumno' debe ser texto")
    .trim()
];
