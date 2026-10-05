import { body, param } from 'express-validator';

/**
 * Validaciones para creación de materia
 */
export const createMateriaValidator = [
  body('nombre')
    .exists({ checkFalsy: true }).withMessage("El campo 'nombre' de la materia es obligatorio")
    .isString().withMessage("El campo 'nombre' debe ser una cadena de texto")
    .trim()
    .isLength({ min: 3, max: 100 }).withMessage("El nombre debe contener entre 3 y 100 caracteres"),

  body('codigo')
    .exists({ checkFalsy: true }).withMessage("El campo 'codigo' de la materia es obligatorio")
    .isString().withMessage("El campo 'codigo' debe ser una cadena de texto")
    .trim()
    .isLength({ min: 2, max: 20 }).withMessage("El código debe contener entre 2 y 20 caracteres")
];

/**
 * Validación de parámetro ID de materia
 */
export const materiaIdParamValidator = [
  param('id')
    .isInt({ gt: 0 }).withMessage("El parámetro de ruta 'id' debe ser un entero positivo")
    .toInt()
];
