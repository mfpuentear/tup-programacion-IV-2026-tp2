const { body, param, query } = require('express-validator');
const pool = require('../config/db');

const validateCreateTarea = [
    body('nombre')
        .exists().withMessage('El nombre de la tarea es obligatorio')
        .bail()
        .isString().withMessage('El nombre debe ser una cadena de texto')
        .bail()
        .trim()
        .notEmpty().withMessage('El nombre no puede estar vacío o contener solo espacios')
        .bail()
        .custom(async (value) => {
            const [rows] = await pool.query(
                'SELECT id FROM tareas WHERE LOWER(TRIM(nombre)) = LOWER(TRIM(?))',
                [value]
            );
            if (rows.length > 0) {
                throw new Error('Ya existe una tarea con el mismo nombre');
            }
            return true;
        }),
    body('estado')
        .optional()
        .isBoolean().withMessage('El estado debe ser un valor booleano (true o false)')
        .toBoolean()
];

const validateUpdateTarea = [
    param('id')
        .isInt({ gt: 0 }).withMessage('El ID debe ser un número entero mayor a 0')
        .toInt(),
    body('nombre')
        .exists().withMessage('El nombre de la tarea es obligatorio')
        .bail()
        .isString().withMessage('El nombre debe ser una cadena de texto')
        .bail()
        .trim()
        .notEmpty().withMessage('El nombre no puede estar vacío')
        .bail()
        .custom(async (value, { req }) => {
            const { id } = req.params;
            const [rows] = await pool.query(
                'SELECT id FROM tareas WHERE LOWER(TRIM(nombre)) = LOWER(TRIM(?)) AND id != ?',
                [value, id]
            );
            if (rows.length > 0) {
                throw new Error('Ya existe otra tarea con el mismo nombre');
            }
            return true;
        }),
    body('estado')
        .exists().withMessage('El estado de la tarea es obligatorio')
        .bail()
        .isBoolean().withMessage('El estado debe ser un valor booleano (true o false)')
        .toBoolean()
];

const validateIdParam = [
    param('id')
        .isInt({ gt: 0 }).withMessage('El ID debe ser un número entero mayor a 0')
        .toInt()
];

const validateQueryFilter = [
    query('estado')
        .optional()
        .isIn(['completadas', 'pendientes', 'todas'])
        .withMessage('El filtro de estado debe ser: completadas, pendientes o todas')
];

module.exports = {
    validateCreateTarea,
    validateUpdateTarea,
    validateIdParam,
    validateQueryFilter
};
