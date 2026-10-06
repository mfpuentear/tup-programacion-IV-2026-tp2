const { body, param, validationResult } = require('express-validator');
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

const validateCalificacion = [
  body('alumno')
    .trim()
    .notEmpty().withMessage('El nombre del alumno es obligatorio')
    .isLength({ min: 3, max: 150 }).withMessage('El nombre debe tener entre 3 y 150 caracteres'),
  
  body('materia_id')
    .isInt({ gt: 0 }).withMessage('Debe seleccionar una materia válida')
    .custom(async (value) => {
      const [materia] = await db.query('SELECT id FROM materias WHERE id = ?', [value]);
      if (materia.length === 0) {
        throw new Error('La materia especificada no existe en el sistema');
      }
      return true;
    }),

  body('nota1')
    .isFloat({ min: 1, max: 10 }).withMessage('La nota 1 debe ser un número entre 1 y 10'),
  body('nota2')
    .isFloat({ min: 1, max: 10 }).withMessage('La nota 2 debe ser un número entre 1 y 10'),
  body('nota3')
    .isFloat({ min: 1, max: 10 }).withMessage('La nota 3 debe ser un número entre 1 y 10'),

  // Validación de Unicidad (Alumno + Materia)
  body().custom(async (value, { req }) => {
    const { alumno, materia_id } = req.body;
    const idActual = req.params?.id;

    if (!alumno || !materia_id) return true;

    let sql = 'SELECT id FROM calificaciones WHERE LOWER(alumno) = LOWER(?) AND materia_id = ?';
    const params = [alumno.trim(), materia_id];

    if (idActual) {
      sql += ' AND id != ?';
      params.push(idActual);
    }

    const [rows] = await db.query(sql, params);
    if (rows.length > 0) {
      throw new Error('Ya existe una calificación registrada para este alumno en la materia seleccionada');
    }
    return true;
  }),

  handleValidationErrors
];

const validateIdParam = [
  param('id').isInt({ gt: 0 }).withMessage('El ID debe ser un entero positivo'),
  handleValidationErrors
];

module.exports = {
  validateCalificacion,
  validateIdParam
};