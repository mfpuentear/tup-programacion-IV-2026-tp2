import { validationResult } from "express-validator";

export const MENSAJE_DUPLICADO = "Ya existe un registro igual";
export const MENSAJE_ALUMNO_INEXISTENTE = "El alumno indicado no existe";
export const MENSAJE_MATERIA_INEXISTENTE = "La materia indicada no existe";

const MENSAJES_INEXISTENTE = [
  MENSAJE_ALUMNO_INEXISTENTE,
  MENSAJE_MATERIA_INEXISTENTE,
];

export const validar = (req, res, next) => {
  const errores = validationResult(req).array();
  if (errores.length === 0) return next();

  let estado = 400;
  if (errores.every((e) => e.msg === MENSAJE_DUPLICADO)) estado = 409;
  else if (errores.every((e) => MENSAJES_INEXISTENTE.includes(e.msg))) estado = 404;

  res.status(estado).json({
    errores: errores.map((e) => ({ campo: e.path, mensaje: e.msg })),
  });
};