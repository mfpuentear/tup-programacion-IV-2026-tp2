const { body, param, query } = require('express-validator');


const reglaNota = (campo) => 
  body(campo)
    .exists().withMessage(`La ${campo} es obligatoria`)
    .isFloat({ min: 1.00, max: 10.00 })
    .withMessage(`La ${campo} debe ser un número dentro de la escala permitida (1.00 a 10.00)`);

exports.crearCalificacionValidator = [
  body('alumno_nombre')
    .exists().withMessage('El nombre del alumno es obligatorio')
    .trim()
    .notEmpty().withMessage('El nombre del alumno no puede estar vacío')
    .isString().withMessage('El nombre debe ser un texto válido')
    .isLength({ min: 3, max: 100 }).withMessage('El nombre debe contener entre 3 y 100 caracteres'),

  body('materia_id')
    .exists().withMessage('El ID de la materia es obligatorio')
    .isInt({ min: 1 }).withMessage('El ID de la materia debe ser un entero positivo'),

  
  reglaNota('nota1'),
  reglaNota('nota2'),
  reglaNota('nota3')
];

exports.actualizarCalificacionValidator = [
  param('id')
    .isInt({ min: 1 }).withMessage('El ID del registro a modificar debe ser un entero positivo'),
  ...exports.crearCalificacionValidator
];

exports.consultaFiltroValidator = [
  query('materia_id')
    .optional()
    .isInt({ min: 1 }).withMessage('El parámetro de consulta materia_id debe ser un entero positivo')
];