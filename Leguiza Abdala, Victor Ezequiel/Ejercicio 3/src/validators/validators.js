import { validationResult, body, param } from 'express-validator';
import { conexionBD } from '../db.js';

export const revisarErrores = (req, res, next) => {
  const fallos = validationResult(req);
  if (!fallos.isEmpty()) return res.status(400).json({ errores: fallos.array() });
  next();
};

export const validarID = [
  param('id').isInt({ gt: 0 }).withMessage('El ID debe ser numérico y positivo').toInt()
];

export const validarCalificacion = [
  body('nombre_alumno')
    .exists().withMessage('El nombre del alumno es obligatorio')
    .bail()
    .isString().withMessage('El nombre debe ser texto')
    .trim()
    .notEmpty().withMessage('El nombre no puede estar vacío'),
    
  body('nota_1').isFloat({ min: 1, max: 10 }).withMessage('La nota_1 debe ser numérica entre 1.00 y 10.00'),
  body('nota_2').isFloat({ min: 1, max: 10 }).withMessage('La nota_2 debe ser numérica entre 1.00 y 10.00'),
  body('nota_3').isFloat({ min: 1, max: 10 }).withMessage('La nota_3 debe ser numérica entre 1.00 y 10.00'),

  body('id_materia')
    .isInt({ gt: 0 }).withMessage('El id_materia debe ser un entero válido')
    .custom(async (value, { req }) => {
      const [materias] = await conexionBD.query('SELECT * FROM materias WHERE id_materia = ?', [value]);
      if (materias.length === 0) throw new Error('La materia indicada no existe en el sistema');

      if (req.body.nombre_alumno) {
        let consulta = `
          SELECT * FROM calificaciones 
          WHERE LOWER(TRIM(nombre_alumno)) = LOWER(TRIM(?)) AND id_materia = ?
        `;
        let parametros = [req.body.nombre_alumno, value];
        
        if (req.params.id) {
          consulta += ' AND id_calificacion != ?';
          parametros.push(req.params.id);
        }

        const [duplicados] = await conexionBD.query(consulta, parametros);
        if (duplicados.length > 0) {
          throw new Error('Este alumno ya tiene calificaciones registradas para esta misma materia');
        }
      }
      return true;
    })
];