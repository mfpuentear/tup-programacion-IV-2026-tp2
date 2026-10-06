import { body, param, query, validationResult } from 'express-validator';
import pool from '../config/db.js';

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: 'error',
      message: 'Error de validación en la solicitud',
      errors: errors.array().map(err => ({ field: err.path, msg: err.msg }))
    });
  }
  next();
};

export const validateId = [
  param('id')
    .isInt({ min: 1 }).withMessage('El ID debe ser un número entero positivo'),
  handleValidationErrors
];

export const validateMateriaBody = [
  body('nombre')
    .exists({ checkNull: true }).withMessage('El nombre de la materia es obligatorio')
    .isString().withMessage('El nombre de la materia debe ser texto')
    .trim()
    .notEmpty().withMessage('El nombre de la materia no puede estar vacío')
    .isLength({ min: 3, max: 100 }).withMessage('El nombre debe tener entre 3 y 100 caracteres')
    .custom(async (value, { req }) => {
      const nombreLimpio = value.trim().toLowerCase();
      const materiaId = req.params?.id;

      let querySQL = 'SELECT id FROM materias WHERE LOWER(TRIM(nombre)) = ?';
      const params = [nombreLimpio];

      if (materiaId) {
        querySQL += ' AND id != ?';
        params.push(materiaId);
      }

      const [rows] = await pool.query(querySQL, params);
      if (rows.length > 0) {
        throw new Error('Ya existe una materia registrada con ese nombre');
      }
      return true;
    }),
  handleValidationErrors
];

export const validateCrearAlumnoMateriaBody = [
  body('alumno')
    .exists({ checkNull: true }).withMessage('El nombre del alumno es obligatorio')
    .isString().withMessage('El nombre del alumno debe ser una cadena de texto')
    .trim()
    .notEmpty().withMessage('El nombre del alumno no puede estar vacío')
    .isLength({ min: 3, max: 150 }).withMessage('El nombre del alumno debe tener entre 3 y 150 caracteres'),

  body('materia_id')
    .exists({ checkNull: true }).withMessage('El ID de la materia es obligatorio')
    .isInt({ min: 1 }).withMessage('El ID de la materia debe ser un entero positivo')
    .custom(async (value) => {
      const [rows] = await pool.query('SELECT id FROM materias WHERE id = ?', [value]);
      if (rows.length === 0) {
        throw new Error('La materia especificada no existe');
      }
      return true;
    }),

  // Validación de la regla de unicidad (Alumno + Materia)
  body('alumno')
    .custom(async (value, { req }) => {
      if (!value || !req.body.materia_id) return true;
      const alumnoLimpio = value.trim().toLowerCase();
      const materiaId = req.body.materia_id;

      const [rows] = await pool.query(
        'SELECT id FROM alumno_materia WHERE LOWER(TRIM(alumno)) = ? AND materia_id = ?',
        [alumnoLimpio, materiaId]
      );

      if (rows.length > 0) {
        throw new Error('El alumno ya tiene un registro de calificaciones en esta materia');
      }
      return true;
    }),

  // Se exigen exactamente las 3 notas en escala de 1 a 10
  body('nota1')
    .exists({ checkNull: true }).withMessage('La nota1 es obligatoria')
    .isFloat({ min: 1, max: 10 }).withMessage('La nota1 debe ser un número entre 1 y 10'),

  body('nota2')
    .exists({ checkNull: true }).withMessage('La nota2 es obligatoria')
    .isFloat({ min: 1, max: 10 }).withMessage('La nota2 debe ser un número entre 1 y 10'),

  body('nota3')
    .exists({ checkNull: true }).withMessage('La nota3 es obligatoria')
    .isFloat({ min: 1, max: 10 }).withMessage('La nota3 debe ser un número entre 1 y 10'),

  body('promedio').not().exists().withMessage('El promedio no debe enviarse, se calcula en el servidor'),

  handleValidationErrors
];

export const validateActualizarAlumnoMateriaBody = [
  body('alumno')
    .optional()
    .isString().withMessage('El nombre del alumno debe ser texto')
    .trim()
    .notEmpty().withMessage('El nombre del alumno no puede estar vacío')
    .isLength({ min: 3, max: 150 }).withMessage('El nombre del alumno debe tener entre 3 y 150 caracteres'),

  body('materia_id')
    .optional()
    .isInt({ min: 1 }).withMessage('El ID de la materia debe ser un entero positivo')
    .custom(async (value) => {
      const [rows] = await pool.query('SELECT id FROM materias WHERE id = ?', [value]);
      if (rows.length === 0) {
        throw new Error('La materia especificada no existe');
      }
      return true;
    }),

  // Verificación de unicidad al actualizar
  body().custom(async (body, { req }) => {
    const registroId = req.params.id;
    const [existing] = await pool.query('SELECT alumno, materia_id FROM alumno_materia WHERE id = ?', [registroId]);
    
    if (existing.length === 0) return true;

    const alumnoNuevo = body.alumno ? body.alumno.trim().toLowerCase() : existing[0].alumno.toLowerCase();
    const materiaIdNueva = body.materia_id ? body.materia_id : existing[0].materia_id;

    const [rows] = await pool.query(
      'SELECT id FROM alumno_materia WHERE LOWER(TRIM(alumno)) = ? AND materia_id = ? AND id != ?',
      [alumnoNuevo, materiaIdNueva, registroId]
    );

    if (rows.length > 0) {
      throw new Error('El alumno ya posee un registro para esta materia');
    }
    return true;
  }),

  body('nota1')
    .optional()
    .isFloat({ min: 1, max: 10 }).withMessage('La nota1 debe ser un número entre 1 y 10'),

  body('nota2')
    .optional()
    .isFloat({ min: 1, max: 10 }).withMessage('La nota2 debe ser un número entre 1 y 10'),

  body('nota3')
    .optional()
    .isFloat({ min: 1, max: 10 }).withMessage('La nota3 debe ser un número entre 1 y 10'),

  body('promedio').not().exists().withMessage('El promedio no debe enviarse, se calcula en el servidor'),

  handleValidationErrors
];