import { body, param, query } from 'express-validator';

/**
 * Validaciones para creación de tareas (POST /api/tareas)
 */
export const createTaskValidator = [
  body('nombre')
    .exists({ checkFalsy: true }).withMessage("El campo 'nombre' es obligatorio")
    .isString().withMessage("El campo 'nombre' debe ser una cadena de texto")
    .trim()
    .isLength({ min: 2, max: 150 }).withMessage("El campo 'nombre' debe tener entre 2 y 150 caracteres"),

  body('estado')
    .optional()
    .isBoolean().withMessage("El campo 'estado' debe ser un valor booleano (true o false)")
    .toBoolean()
];

/**
 * Validaciones para modificación completa de tareas (PUT /api/tareas/:id)
 */
export const updateTaskValidator = [
  param('id')
    .isInt({ gt: 0 }).withMessage("El parámetro de ruta 'id' debe ser un número entero positivo")
    .toInt(),

  body('nombre')
    .exists({ checkFalsy: true }).withMessage("El campo 'nombre' es obligatorio")
    .isString().withMessage("El campo 'nombre' debe ser una cadena de texto")
    .trim()
    .isLength({ min: 2, max: 150 }).withMessage("El campo 'nombre' debe tener entre 2 y 150 caracteres"),

  body('estado')
    .exists().withMessage("El campo 'estado' es obligatorio en actualización completa")
    .isBoolean().withMessage("El campo 'estado' debe ser un valor booleano (true o false)")
    .toBoolean()
];

/**
 * Validaciones para cambio parcial de estado (PATCH /api/tareas/:id/estado)
 */
export const patchTaskStatusValidator = [
  param('id')
    .isInt({ gt: 0 }).withMessage("El parámetro de ruta 'id' debe ser un número entero positivo")
    .toInt(),

  body('estado')
    .exists().withMessage("El campo 'estado' es obligatorio")
    .isBoolean().withMessage("El campo 'estado' debe ser un valor booleano (true o false)")
    .toBoolean()
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
 * Validación de parámetros de consulta (query params) para listado
 */
export const queryTaskValidator = [
  query('estado')
    .optional()
    .isIn(['completadas', 'pendientes', 'todas', 'true', 'false', '1', '0'])
    .withMessage("El parámetro de consulta 'estado' solo admite: 'completadas', 'pendientes', 'todas', 'true' o 'false'"),

  query('orden')
    .optional()
    .isIn(['asc', 'desc', 'ASC', 'DESC'])
    .withMessage("El parámetro 'orden' debe ser 'asc' o 'desc'"),

  query('limite')
    .optional()
    .isInt({ gt: 0, lte: 100 })
    .withMessage("El parámetro 'limite' debe ser un número entero entre 1 y 100")
    .toInt()
];
