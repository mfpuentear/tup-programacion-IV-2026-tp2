import { body, param, query, validationResult } from "express-validator";

// Validacion de id
export const validarId = param("id").isInt({ min: 1 });

// Validacion de tarea
export const validarTarea = [
  body("nombre")
    .trim()
    .notEmpty()
    .withMessage("El nombre es obligatorio")
    .isLength({ min: 1, max: 100 })
    .withMessage("El nombre debe tener entre 1 y 100 caracteres"),
  body("completada")
    .isBoolean()
    .withMessage("completada debe ser un valor booleano (true o false)"),
];

// Validacion del filtro de estado
export const validarFiltroEstado = [
  query("completada")
    .optional()
    .isBoolean()
    .withMessage("El filtro completada debe ser true o false"),
];

// Middleware para verificar validaciones
export const verificarValidaciones = (req, res, next) => {
  const resultadoValidacion = validationResult(req);
  if (!resultadoValidacion.isEmpty()) {
    return res.status(400).json({
      mensaje: "Parámetros no válidos",
      errores: resultadoValidacion.array(),
    });
  }
  next();
};
