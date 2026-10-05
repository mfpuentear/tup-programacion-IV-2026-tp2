import { body, param, query } from 'express-validator';

/**
 * Validaciones para creación de rectángulos (POST /api/rectangulos)
 */
export const createRectangleValidator = [
  body('lado1')
    .exists({ checkFalsy: false }).withMessage("El campo 'lado1' es obligatorio")
    .isFloat({ gt: 0 }).withMessage("El campo 'lado1' debe ser un número mayor a cero")
    .toFloat(),

  body('lado2')
    .exists({ checkFalsy: false }).withMessage("El campo 'lado2' es obligatorio")
    .isFloat({ gt: 0 }).withMessage("El campo 'lado2' debe ser un número mayor a cero")
    .toFloat(),

  // Rechazar expresamente si el cliente intenta enviar perímetro o superficie
  body('perimetro')
    .custom((val) => {
      if (val !== undefined) {
        throw new Error("No se permite enviar 'perimetro' desde el cliente; es calculado automáticamente en el servidor");
      }
      return true;
    }),

  body('superficie')
    .custom((val) => {
      if (val !== undefined) {
        throw new Error("No se permite enviar 'superficie' desde el cliente; es calculada automáticamente en el servidor");
      }
      return true;
    })
];

/**
 * Validaciones para modificación de rectángulos (PUT /api/rectangulos/:id)
 */
export const updateRectangleValidator = [
  param('id')
    .isInt({ gt: 0 }).withMessage("El parámetro de ruta 'id' debe ser un número entero positivo")
    .toInt(),

  body('lado1')
    .exists({ checkFalsy: false }).withMessage("El campo 'lado1' es obligatorio")
    .isFloat({ gt: 0 }).withMessage("El campo 'lado1' debe ser un número mayor a cero")
    .toFloat(),

  body('lado2')
    .exists({ checkFalsy: false }).withMessage("El campo 'lado2' es obligatorio")
    .isFloat({ gt: 0 }).withMessage("El campo 'lado2' debe ser un número mayor a cero")
    .toFloat(),

  body('perimetro')
    .custom((val) => {
      if (val !== undefined) {
        throw new Error("No se permite enviar 'perimetro' desde el cliente; es calculado automáticamente en el servidor");
      }
      return true;
    }),

  body('superficie')
    .custom((val) => {
      if (val !== undefined) {
        throw new Error("No se permite enviar 'superficie' desde el cliente; es calculada automáticamente en el servidor");
      }
      return true;
    })
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
 * Validación para consultas (query params) en GET /api/rectangulos
 */
export const queryRectangleValidator = [
  query('orden')
    .optional()
    .isIn(['asc', 'desc', 'ASC', 'DESC']).withMessage("El parámetro 'orden' debe ser 'asc' o 'desc'"),

  query('limite')
    .optional()
    .isInt({ gt: 0, lte: 100 }).withMessage("El parámetro 'limite' debe ser un número entero entre 1 y 100")
    .toInt(),

  query('esCuadrado')
    .optional()
    .isIn(['true', 'false']).withMessage("El parámetro 'esCuadrado' debe ser 'true' o 'false'")
];
