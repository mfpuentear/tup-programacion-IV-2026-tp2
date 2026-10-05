import { body, param, query, validationResult } from "express-validator";

export const validarId = [
  param("id")
    .isInt({ min: 1 })
    .withMessage("El id debe ser un número entero mayor a 0"),
];

export const validarTarea = [
  body("nombre")
    .trim()
    .notEmpty()
    .withMessage("El nombre es obligatorio")
    .isLength({ max: 100 })
    .withMessage("El nombre no puede superar los 100 caracteres"),

  body("completada")
    .isBoolean()
    .withMessage("Completada debe ser un valor booleano"),
];

export const validarEstado = [
  query("completada")
    .optional()
    .isBoolean()
    .withMessage("El estado debe ser true o false"),
];

export const verificarValidaciones = (req, res, next) => {
  const errores = validationResult(req);

  if (!errores.isEmpty()) {
    return res.status(400).send({
      errores: errores.array(),
    });
  }

  next();
};