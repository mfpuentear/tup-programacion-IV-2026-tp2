import { body, param, query, validationResult } from "express-validator";

// Validar creacion o modificacion de tarea
export const validarTarea = [
  body("nombre")
    .notEmpty().withMessage("Se necesita el nombre")
    .isLength({ min: 2 }).withMessage("El nombre debe tener al menos 2 caracteres"),
  body("completada")
    .isBoolean().withMessage("El estado debe ser booleano (true/false)")
];

// Validar ID
export const validarId = param("id")
  .isInt({ min: 1 })
  .withMessage("El ID debe ser un numero entero positivo");

// Validar filtro por estado
export const validarEstado = query("completada")
  .optional()
  .isBoolean().withMessage("El filtro debe ser true o false");

export const verificarValidaciones = (req, res, next) => {
  const resultado = validationResult(req);
  if (!resultado.isEmpty()) {
    return res.status(400).json({
      mensaje: "Parametros no validos",
      errores: resultado.array(),
    });
  }
  next();
};
