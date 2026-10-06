const { body, param, query, validationResult } = require('express-validator');
const db = require('../config/db');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: 'error',
      errors: errors.array().map(err => ({ campo: err.path, mensaje: err.msg }))
    });
  }
  next();
};

const validateTaskBody = [
  body('nombre')
    .trim()
    .notEmpty().withMessage('El nombre es obligatorio')
    .isLength({ min: 3, max: 255 }).withMessage('El nombre debe tener entre 3 y 255 caracteres')
    .custom(async (value, { req }) => {
      const nombreLimpio = value.trim();
      const idActual = req.params?.id;

      let sql = 'SELECT id FROM tareas WHERE LOWER(nombre) = LOWER(?)';
      const params = [nombreLimpio];

      if (idActual) {
        sql += ' AND id != ?';
        params.push(idActual);
      }

      const [rows] = await db.query(sql, params);
      if (rows.length > 0) {
        throw new Error('Ya existe una tarea con ese nombre');
      }
      return true;
    }),
  body('completada')
    .optional()
    .isBoolean().withMessage('El estado completada debe ser un valor booleano (true/false)'),
  handleValidationErrors
];

const validateFilterQuery = [
  query('completada')
    .optional()
    .isIn(['true', 'false', '1', '0']).withMessage('El filtro completada debe ser "true", "false", "1" o "0"'),
  handleValidationErrors
];

const validateIdParam = [
  param('id')
    .isInt({ gt: 0 }).withMessage('El ID debe ser un número entero mayor a 0'),
  handleValidationErrors
];

module.exports = {
  validateTaskBody,
  validateFilterQuery,
  validateIdParam
};