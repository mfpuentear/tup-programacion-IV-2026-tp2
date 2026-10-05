const { body, param, query, validationResult } = require('express-validator');
const pool = require('../db');

const NOTA_MIN = 0;
const NOTA_MAX = 10;

const validar = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errores: errors.array().map((e) => ({ campo: e.path, mensaje: e.msg })) });
  }
  next();
};

const idParam = param('id').isInt({ min: 1 }).withMessage('El id debe ser un entero positivo').toInt();

const alumnoBody = body('alumno')
  .exists({ values: 'falsy' }).withMessage('El nombre del alumno es obligatorio').bail()
  .isString().withMessage('El nombre del alumno debe ser texto').bail()
  .trim()
  .customSanitizer((v) => v.replace(/\s+/g, ' '))
  .isLength({ min: 2, max: 100 }).withMessage('El alumno debe tener entre 2 y 100 caracteres').bail()
  .matches(/^[\p{L}][\p{L}\s.,'-]*$/u).withMessage('El nombre del alumno contiene caracteres no válidos');

const materiaBody = body('materia_id')
  .exists({ values: 'falsy' }).withMessage('La materia es obligatoria').bail()
  .isInt({ min: 1 }).withMessage('materia_id debe ser un entero positivo').bail()
  .toInt()
  .custom(async (materiaId) => {
    const [rows] = await pool.query('SELECT id FROM materias WHERE id = ?', [materiaId]);
    if (!rows.length) throw new Error('La materia indicada no existe');
    return true;
  }).bail()
  // Unicidad alumno + materia (al modificar se excluye el propio registro)
  .custom(async (materiaId, { req }) => {
    const alumno = req.body.alumno;
    if (typeof alumno !== 'string') return true;
    const idActual = req.params && req.params.id ? Number(req.params.id) : 0;
    const [rows] = await pool.query(
      'SELECT id FROM calificaciones WHERE alumno = ? AND materia_id = ? AND id <> ?',
      [alumno, materiaId, idActual]
    );
    if (rows.length) throw new Error('Ya existe un registro para ese alumno en esa materia');
    return true;
  });

const notasBody = [
  body('notas')
    .exists().withMessage('Las notas son obligatorias').bail()
    .isArray({ min: 3, max: 3 }).withMessage('Se deben informar exactamente 3 notas'),
  body('notas.*').custom((n) => {
    if (typeof n !== 'number' || !Number.isFinite(n)) throw new Error('Cada nota debe ser un número');
    if (n < NOTA_MIN || n > NOTA_MAX) throw new Error(`Cada nota debe estar entre ${NOTA_MIN} y ${NOTA_MAX}`);
    if (Math.round(n * 100) !== n * 100) throw new Error('Las notas admiten hasta 2 decimales');
    return true;
  }),
];

const cuerpo = [alumnoBody, materiaBody, ...notasBody];

const filtros = [
  query('alumno').optional().isString().trim().notEmpty().withMessage('El filtro alumno no puede estar vacío'),
  query('materia_id').optional().isInt({ min: 1 }).withMessage('El filtro materia_id debe ser un entero positivo').toInt(),
];

module.exports = {
  validarId: [idParam, validar],
  validarCrear: [...cuerpo, validar],
  validarActualizar: [idParam, ...cuerpo, validar],
  validarFiltros: [...filtros, validar],
};
