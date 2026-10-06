const { body, param, query } = require('express-validator');
const pool = require('../config/db');

const validateCreateCalificacion = [
    body('alumno')
        .exists().withMessage('El nombre del alumno es obligatorio')
        .bail()
        .isString().withMessage('El nombre del alumno debe ser una cadena de texto')
        .bail()
        .trim()
        .notEmpty().withMessage('El nombre del alumno no puede estar vacío'),

    body('materia_id')
        .exists().withMessage('El ID de la materia es obligatorio')
        .bail()
        .isInt({ gt: 0 }).withMessage('El ID de la materia debe ser un número entero mayor a 0')
        .bail()
        .toInt()
        .custom(async (materiaId) => {
            const [rows] = await pool.query('SELECT id FROM materias WHERE id = ?', [materiaId]);
            if (rows.length === 0) {
                throw new Error(`La materia con ID ${materiaId} no existe en la base de datos`);
            }
            return true;
        })
        .bail()
        .custom(async (materiaId, { req }) => {
            const alumno = req.body.alumno;
            if (!alumno || typeof alumno !== 'string') return true;

            const [rows] = await pool.query(
                'SELECT id FROM calificaciones WHERE LOWER(TRIM(alumno)) = LOWER(TRIM(?)) AND materia_id = ?',
                [alumno, materiaId]
            );
            if (rows.length > 0) {
                throw new Error('Ya existe un registro de calificaciones para este alumno en la materia seleccionada');
            }
            return true;
        }),

    body('nota1')
        .exists().withMessage('La nota 1 es obligatoria')
        .bail()
        .isFloat({ min: 1, max: 10 }).withMessage('La nota 1 debe ser un valor numérico entre 1 y 10')
        .toFloat(),

    body('nota2')
        .exists().withMessage('La nota 2 es obligatoria')
        .bail()
        .isFloat({ min: 1, max: 10 }).withMessage('La nota 2 debe ser un valor numérico entre 1 y 10')
        .toFloat(),

    body('nota3')
        .exists().withMessage('La nota 3 es obligatoria')
        .bail()
        .isFloat({ min: 1, max: 10 }).withMessage('La nota 3 debe ser un valor numérico entre 1 y 10')
        .toFloat()
];

const validateUpdateCalificacion = [
    param('id')
        .isInt({ gt: 0 }).withMessage('El ID debe ser un número entero mayor a 0')
        .toInt(),

    body('alumno')
        .exists().withMessage('El nombre del alumno es obligatorio')
        .bail()
        .isString().withMessage('El nombre del alumno debe ser una cadena de texto')
        .bail()
        .trim()
        .notEmpty().withMessage('El nombre del alumno no puede estar vacío'),

    body('materia_id')
        .exists().withMessage('El ID de la materia es obligatorio')
        .bail()
        .isInt({ gt: 0 }).withMessage('El ID de la materia debe ser un número entero mayor a 0')
        .bail()
        .toInt()
        .custom(async (materiaId) => {
            const [rows] = await pool.query('SELECT id FROM materias WHERE id = ?', [materiaId]);
            if (rows.length === 0) {
                throw new Error(`La materia con ID ${materiaId} no existe en la base de datos`);
            }
            return true;
        })
        .bail()
        .custom(async (materiaId, { req }) => {
            const { id } = req.params;
            const alumno = req.body.alumno;
            if (!alumno || typeof alumno !== 'string') return true;

            const [rows] = await pool.query(
                'SELECT id FROM calificaciones WHERE LOWER(TRIM(alumno)) = LOWER(TRIM(?)) AND materia_id = ? AND id != ?',
                [alumno, materiaId, id]
            );
            if (rows.length > 0) {
                throw new Error('Ya existe otro registro de calificaciones para este alumno en la materia seleccionada');
            }
            return true;
        }),

    body('nota1')
        .exists().withMessage('La nota 1 es obligatoria')
        .bail()
        .isFloat({ min: 1, max: 10 }).withMessage('La nota 1 debe ser un valor numérico entre 1 y 10')
        .toFloat(),

    body('nota2')
        .exists().withMessage('La nota 2 es obligatoria')
        .bail()
        .isFloat({ min: 1, max: 10 }).withMessage('La nota 2 debe ser un valor numérico entre 1 y 10')
        .toFloat(),

    body('nota3')
        .exists().withMessage('La nota 3 es obligatoria')
        .bail()
        .isFloat({ min: 1, max: 10 }).withMessage('La nota 3 debe ser un valor numérico entre 1 y 10')
        .toFloat()
];

const validateIdParam = [
    param('id')
        .isInt({ gt: 0 }).withMessage('El ID debe ser un número entero mayor a 0')
        .toInt()
];

const validateQueryFilter = [
    query('materia_id')
        .optional()
        .isInt({ gt: 0 }).withMessage('El ID de la materia a filtrar debe ser un entero positivo')
        .toInt(),
    query('alumno')
        .optional()
        .isString().withMessage('El filtro de alumno debe ser una cadena de texto')
        .trim()
];

module.exports = {
    validateCreateCalificacion,
    validateUpdateCalificacion,
    validateIdParam,
    validateQueryFilter
};
