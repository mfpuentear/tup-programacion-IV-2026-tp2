const { body, param, validationResult } = require('express-validator');
const db = require('../database');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: 'error',
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  next();
};

const isGradeValid = (value) => {
  const num = parseFloat(value);
  return !isNaN(num) && num >= 1 && num <= 10;
};

const validateCreateGrade = [
  body('student_name')
    .trim()
    .notEmpty().withMessage('El nombre del alumno es obligatorio.')
    .isLength({ min: 3, max: 100 }).withMessage('El nombre debe tener entre 3 y 100 caracteres.')
    .custom(async (student_name, { req }) => {
      const { subject_id } = req.body;
      if (student_name && subject_id) {
        const [rows] = await db.query(
          'SELECT id FROM grades WHERE LOWER(student_name) = LOWER(?) AND subject_id = ?',
          [student_name.trim(), subject_id]
        );
        if (rows.length > 0) {
          throw new Error('Ya existe un registro de calificaciones para este alumno en la materia seleccionada.');
        }
      }
      return true;
    }),

  body('subject_id')
    .notEmpty().withMessage('La materia es obligatoria.')
    .isInt({ min: 1 }).withMessage('El ID de la materia debe ser un entero positivo.')
    .custom(async (subject_id) => {
      const [rows] = await db.query('SELECT id FROM subjects WHERE id = ?', [subject_id]);
      if (rows.length === 0) {
        throw new Error('La materia especificada no existe.');
      }
      return true;
    }),

  body('note1')
    .notEmpty().withMessage('La nota 1 es obligatoria.')
    .custom(isGradeValid).withMessage('La nota 1 debe ser un número entre 1 y 10.'),

  body('note2')
    .notEmpty().withMessage('La nota 2 es obligatoria.')
    .custom(isGradeValid).withMessage('La nota 2 debe ser un número entre 1 y 10.'),

  body('note3')
    .notEmpty().withMessage('La nota 3 es obligatoria.')
    .custom(isGradeValid).withMessage('La nota 3 debe ser un número entre 1 y 10.'),

  handleValidationErrors
];

const validateUpdateGrade = [
  param('id')
    .isInt({ min: 1 }).withMessage('El ID debe ser un número entero positivo.'),

  body('student_name')
    .optional()
    .trim()
    .notEmpty().withMessage('El nombre del alumno no puede estar vacío.')
    .isLength({ min: 3, max: 100 }).withMessage('El nombre debe tener entre 3 y 100 caracteres.')
    .custom(async (student_name, { req }) => {
      const gradeId = req.params.id;
      const { subject_id } = req.body;

      const [current] = await db.query('SELECT student_name, subject_id FROM grades WHERE id = ?', [gradeId]);
      if (current.length === 0) {
        throw new Error('El registro de calificaciones no existe.');
      }

      const targetStudent = student_name || current[0].student_name;
      const targetSubject = subject_id || current[0].subject_id;

      const [existing] = await db.query(
        'SELECT id FROM grades WHERE LOWER(student_name) = LOWER(?) AND subject_id = ? AND id != ?',
        [targetStudent.trim(), targetSubject, gradeId]
      );

      if (existing.length > 0) {
        throw new Error('Ya existe otro registro para este alumno en la materia seleccionada.');
      }

      return true;
    }),

  body('subject_id')
    .optional()
    .isInt({ min: 1 }).withMessage('El ID de la materia debe ser un entero positivo.')
    .custom(async (subject_id) => {
      const [rows] = await db.query('SELECT id FROM subjects WHERE id = ?', [subject_id]);
      if (rows.length === 0) {
        throw new Error('La materia especificada no existe.');
      }
      return true;
    }),

  body('note1')
    .optional()
    .custom(isGradeValid).withMessage('La nota 1 debe ser un número entre 1 y 10.'),

  body('note2')
    .optional()
    .custom(isGradeValid).withMessage('La nota 2 debe ser un número entre 1 y 10.'),

  body('note3')
    .optional()
    .custom(isGradeValid).withMessage('La nota 3 debe ser un número entre 1 y 10.'),

  handleValidationErrors
];

const validateIdParam = [
  param('id')
    .isInt({ min: 1 }).withMessage('El ID del registro debe ser un entero positivo.'),
  handleValidationErrors
];

module.exports = {
  validateCreateGrade,
  validateUpdateGrade,
  validateIdParam
};