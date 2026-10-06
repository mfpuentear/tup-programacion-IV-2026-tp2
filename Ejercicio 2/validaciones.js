import { body, param, query, validationResult } from 'express-validator'
import { db } from './db.js'

export const mensajeDuplicado = 'Ya existe una tarea con el mismo nombre'
const estados = ['completada', 'pendiente'];

export const validarId = param('id')
  .isInt({ min: 1 })
  .withMessage('El id debe ser un entero mayor o igual a 1')
  .toInt()


export const validarEstadoFiltro = query('estado')
  .optional()
  .isString()
  .withMessage('El estado debe ser un texto')
  .bail()
  .isIn(estados)
  .withMessage(`El estado debe ser uno de: ${estados.join(', ')}`)

const normalizarNombre = (valor) => valor.trim().replace(/\s+/g, ' ') // Funcion que recorta espacios innecesarios en el campo
  
const validarNombre = ({ obligatorio }) => {
  const cadena = body('nombre')

  if (!obligatorio) cadena.optional() // si no viene, se saltea toda la cadena
    return cadena
    .exists()
    .withMessage('El nombre es obligatorio')
    .bail()
    .isString()
    .withMessage('El nombre debe ser un texto')
    .bail()
    .customSanitizer(normalizarNombre) // se llama la funcion de normalizacion
    .notEmpty()
    .withMessage('El nombre no puede estar vacío')
    .bail()
    .isLength({ max: 100 })
    .withMessage('El nombre no puede superar los 100 caracteres')
    .bail()
    .matches(/[\p{L}\p{N}]/u)
    .withMessage('El nombre debe contener al menos una letra o un número')
    .bail()
    .custom(async (nombre, { req } ) => {
      const idActual = Number(req.params?.id) || 0
      const [filas] = await db.execute(
        'SELECT id FROM tareas WHERE nombre = ? AND id <> ? LIMIT 1',
        [nombre, idActual]
      )
      if (filas.length > 0) throw new Error(mensajeDuplicado)
    })
}


const validarCompletada = ({ obligatorio }) => {
  const cadena = body('completada')
  if (!obligatorio) cadena.optional()
 
  return cadena
    .exists()
    .withMessage('El campo completada es obligatorio')
    .bail()
    .custom((valor) => typeof valor === 'boolean')
    .withMessage('El campo completada debe ser true o false')
}
 
// para PATCH se puede mandar solo uno de los dos, pero al menos uno
const alMenosUnCampo = body().custom((cuerpo) => {
  if (cuerpo?.nombre === undefined && cuerpo?.completada === undefined) {
    throw new Error('Debe enviarse al menos nombre o completada')
  }
  return true
})
 
export const validarCreacion = [
  validarNombre({ obligatorio: true }),
  validarCompletada({ obligatorio: false }), // si no viene, la tarea queda pendiente
]
 
export const validarReemplazo = [
  validarNombre({ obligatorio: true }),
  validarCompletada({ obligatorio: true }),
]
 
export const validarModificacion = [
  alMenosUnCampo,
  validarNombre({ obligatorio: false }),
  validarCompletada({ obligatorio: false }),
]
 
//////
 
export const verificarValidaciones = (req, res, next) => {
  const resultado = validationResult(req)
  if (!resultado.isEmpty()) {
    const errores = resultado.array()

    // definir si todos los errores son por mensaje duplicado o por estar mal formado
    const soloDuplicado = errores.every((e) => e.msg === mensajeDuplicado)
    return res.status(soloDuplicado ? 409 : 400).json({
      mensaje: soloDuplicado ? mensajeDuplicado : 'Parámetros no válidos',
      errores,
    })
  }
  next()
}