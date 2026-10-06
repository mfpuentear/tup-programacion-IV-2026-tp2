import { body, param, query, validationResult } from 'express-validator'
import { db } from './db.js'
 

const notaMin = 0
const notaMax = 10
 
export const mensajeDuplicado = 'Ya existe un registro para este alumno en esa materia'

export const validarId = param('id')
  .isInt({ min: 1 })
  .withMessage('El id debe ser un entero mayor o igual a 1')
  .toInt()
 

 
export const validarFiltro = query('materia_id')
  .optional()
  .isString()
  .withMessage('materia_id debe ser un número')
  .bail()
  .isInt({ min: 1 })
  .withMessage('materia_id debe ser un entero mayor o igual a 1')
  .toInt()
 

 
export const validarMateria = body('nombre')
  .exists()
  .withMessage('El nombre de la materia es obligatorio')
  .bail()
  .isString()
  .withMessage('El nombre de la materia debe ser un texto')
  .bail()
  .trim()
  .isLength({ min: 2, max: 100 })
  .withMessage('El nombre de la materia debe tener entre 2 y 100 caracteres')

  
  export const validarCalificacion = [
  body('alumno')
    .exists()
    .withMessage('El nombre del alumno es obligatorio')
    .bail()
    .isString()
    .withMessage('El nombre del alumno debe ser un texto')
    .bail()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('El nombre del alumno debe tener entre 2 y 100 caracteres')
    .bail()
    .matches(/^[\p{L} .'-]+$/u)
    .withMessage('El nombre del alumno solo puede tener letras, espacios, puntos, apóstrofes y guiones'),
 

  body('materia_id')
    .exists()
    .withMessage('La materia (materia_id) es obligatoria')
    .bail()
    .isInt({ min: 1 })
    .withMessage('materia_id debe ser un entero mayor o igual a 1')
    .bail()
    .toInt()
    // 1) La materia tiene que existir
    .custom(async (materiaId) => {
      const [filas] = await db.execute('SELECT id FROM materias WHERE id = ?', [materiaId])
      if (filas.length === 0) throw new Error('La materia indicada no existe')
    })
    .bail()
    // 2) No puede haber otro registro con el mismo alumno y la misma materia
    .custom(async (materiaId, { req }) => {
      const alumno = req.body.alumno
      if (typeof alumno !== 'string') return true
 
      // En un PUT hay que ignorar el propio registro; en un POST el id vale 0
      const idActual = Number(req.params.id) || 0
 
      const [filas] = await db.execute(
        'SELECT id FROM calificaciones WHERE alumno = ? AND materia_id = ? AND id <> ?',
        [alumno, materiaId, idActual]
      )
      if (filas.length > 0) throw new Error(mensajeDuplicado)
    }),
 

  body(['nota1', 'nota2', 'nota3'])
    .exists()
    .withMessage('Las tres notas (nota1, nota2 y nota3) son obligatorias')
    .bail()
    .isFloat({ min: notaMin, max: notaMax })
    .withMessage(`Cada nota debe ser un número entre ${notaMin} y ${notaMax}`)
    .toFloat(),
]

export const verificarValidaciones = (req, res, next) => {
  const resultado = validationResult(req)
  if (!resultado.isEmpty()) {
    const errores = resultado.array()

    const soloDuplicado = errores.every((e) => e.msg === mensajeDuplicado)
    return res.status(soloDuplicado ? 409 : 400).json({     // si es problema por duplicidad, es 409, pero si es invalidez es 400
      mensaje: soloDuplicado ? mensajeDuplicado : 'Parámetros no válidos',
      errores,
    })
  }
  next()
}