import {body, param, query, validationResult} from 'express-validator';

export const validarId = param('id') // Verificar un id de algun rectangulo
  .isInt({ min: 1 })
  .withMessage('El id debe ser un entero mayor o igual a 1')
  .toInt()


  
const validarLado = (campo) => // Prototipo para validar los campos 'alto' y 'ancho' que si requieren interaccion
  body(campo)
    .notEmpty()
    .withMessage('Todos los campos son obligatorios')
    .bail() // Si esta vacio, detiene la verificacion en este punto
    .isFloat({ gt: 0 }) // para numeros flotantes mayores a 0
    .withMessage(`El campo '${campo}' debe ser un número mayor que cero`)
    .toFloat()


const rechazarCalculado = (campo) => // Prototipo para rechazar un envio de 'superficie' o 'perimetro'
  body(campo)
    .not()
    .exists()
    .withMessage(`'${campo}' lo calcula el servidor y no debe enviarse`)


export const validarDimensiones = [ // Solo va a permitir o rechazar estos campos
  validarLado('ancho'),
  validarLado('alto'),
  rechazarCalculado('perimetro'),
  rechazarCalculado('superficie'),
]


export const verificarValidaciones = (req, res, next) => {
  const resultadoValidacion = validationResult(req)
  if(!resultadoValidacion.isEmpty()) {
    return res.status(400).json({
      mensaje: 'Parámetros no válidos. Revisar campos e intentar nuevamente.',
      errores: resultadoValidacion.array() // Lista de errores
    })
  }
  next()
}