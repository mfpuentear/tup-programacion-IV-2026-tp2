const { body, validationResult } = require('express-validator');
const db = require('../db');

const procesarErrores = (req, res, next) => {
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
        return res.status(400).json({ errores: errores.array() });
    }
    next();
};

const validarCalificacion = [
    body('alumno_nombre')
        .exists().withMessage('El campo "alumno_nombre" es obligatorio.')
        .isString().withMessage('El nombre del alumno debe ser texto.')
        .trim()
        .notEmpty().withMessage('El nombre del alumno no puede estar vacío.'),

    body('materia_id')
        .exists().withMessage('El campo "materia_id" es obligatorio.')
        .isInt({ min: 1 }).withMessage('El ID de la materia debe ser un número entero válido.')
        .custom(async (materia_id) => {
            const [rows] = await db.query('SELECT * FROM materias WHERE id = ?', [materia_id]);
            if (rows.length === 0) {
                throw new Error('La materia especificada no existe en la base de datos.');
            }
        }),

    body(['nota1', 'nota2', 'nota3'])
        .exists().withMessage('Todas las notas (nota1, nota2, nota3) son obligatorias.')
        .isFloat({ min: 1, max: 10 }).withMessage('Cada nota debe ser un valor numérico entre 1.00 y 10.00.'),

    procesarErrores
];

module.exports = { validarCalificacion };