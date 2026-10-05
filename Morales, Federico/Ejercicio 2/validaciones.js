import { body, param, query, validationResult } from "express-validator";
import { db } from "./db.js";

// Validacion de id
export const validarId = param("id").isInt({ min: 1 });

// Validacion del filtro por estado
export const validarFiltroTareas = [
  query("completada").isIn(["true", "false"]).optional(),
];

// Validacion de tarea al crear
export const validarTarea = [
  body("nombre")
    .trim()
    .notEmpty()
    .withMessage("El nombre es obligatorio")
    .isLength({ max: 255 })
    .withMessage("El nombre debe tener hasta 255 caracteres")
    .custom(async (nombre) => {
      const [tareas] = await db.execute(
        "SELECT id FROM tareas WHERE LOWER(TRIM(nombre)) = LOWER(TRIM(?))",
        [nombre],
      );
      if (tareas.length > 0) {
        throw new Error("Ya existe una tarea con ese nombre");
      }
    }),
];

// Validacion del estado al modificar
export const validarEstado = [
  body("completada").isBoolean().withMessage("completada debe ser true o false"),
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