import { validationResult } from "express-validator";
import { MENSAJE_DUPLICADO } from "../validators/tareas.validators.js";

export const validar = (req, res, next) => {
  const errores = validationResult(req).array();
  if (errores.length === 0) return next();

  const soloDuplicado = errores.every((e) => e.msg === MENSAJE_DUPLICADO);
  res.status(soloDuplicado ? 409 : 400).json({
    errores: errores.map((e) => ({ campo: e.path, mensaje: e.msg })),
  });
};