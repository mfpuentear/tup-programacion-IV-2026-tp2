import { validationResult, body, param, query } from 'express-validator';
import { conexionBD } from '../db.js';

export const revisarErrores = (req, res, next) => {
  const fallos = validationResult(req);
  if (!fallos.isEmpty()) {
    return res.status(400).json({ errores: fallos.array() });
  }
  next();
};

export const validarID = [
  param('id')
    .isInt({ gt: 0 }).withMessage('El ID debe ser un número entero y positivo')
    .toInt()
];

export const validarFiltro = [
  query('estado')
    .optional()
    .isIn(['completada', 'pendiente']).withMessage('El estado a filtrar solo puede ser "completada" o "pendiente"')
];

export const validarTarea = [
  body('titulo_tarea')
    .exists().withMessage('El título de la tarea es obligatorio')
    .bail()
    .isString().withMessage('El título debe ser un texto')
    .trim()
    .notEmpty().withMessage('El título no puede estar vacío')
    .bail()
    .custom(async (value, { req }) => {
      let consulta = 'SELECT * FROM tabla_tareas WHERE LOWER(TRIM(titulo_tarea)) = LOWER(TRIM(?))';
      let parametros = [value];

      if (req.params.id) {
        consulta += ' AND id_tarea != ?';
        parametros.push(req.params.id);
      }

      const [filas] = await conexionBD.query(consulta, parametros);
      if (filas.length > 0) {
        throw new Error('Ya existe una tarea con este mismo nombre (ignorando mayúsculas y espacios)');
      }
      return true;
    }),

  body('esta_completada')
    .optional()
    .isBoolean().withMessage('El estado esta_completada debe ser true (verdadero) o false (falso)')
    .toBoolean()
];