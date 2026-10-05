import { validationResult } from 'express-validator';

/**
 * Middleware para capturar y formatear los resultados de express-validator
 */
export function validateRequest(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: 'error',
      mensaje: 'Falló la validación de la solicitud',
      errores: errors.array().map((err) => ({
        campo: err.path || err.param,
        mensaje: err.msg,
        valorRecibido: err.value
      }))
    });
  }
  next();
}
