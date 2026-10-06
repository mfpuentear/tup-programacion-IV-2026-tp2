import { body, param, query, validationResult } from "express-validator";
import { db } from "./db.js";

// Validacion de filtros de tareas
export const validarFiltrosTareas = [
  query("estado")
    .isIn(["completada", "pendiente"])
    .withMessage("El estado debe ser 'completada' o 'pendiente'")
    .optional(),
];

export const validarId = param("id")
  .isInt({ min: 1 })
  .withMessage("El id debe ser un numero entero mayor a 0");

// Validacion del nombre de la tarea
// Criterio para comparar nombres: se quitan los espacios de los extremos y los
// espacios repetidos; MySQL compara sin distinguir mayusculas ni tildes.
const validarNombre = body("nombre")
  .isString()
  .withMessage("El nombre es obligatorio y debe ser un texto")
  .bail()
  .trim()
  .customSanitizer((nombre) => nombre.replace(/\s+/g, " "))
  .isLength({ min: 1, max: 100 })
  .withMessage("El nombre debe tener entre 1 y 100 caracteres")
  .bail()
  .custom(async (nombre, { req }) => {
    // Al modificar, se excluye la propia tarea de la comparacion
    const id = Number(req.params.id ?? 0);

    const [tareas] = await db.execute(
      "SELECT id FROM tareas WHERE nombre=? AND id<>?",
      [nombre, id],
    );

    if (tareas.length > 0) {
      throw new Error("Ya existe una tarea con ese nombre");
    }
  });

// Validacion para crear tarea (completada es opcional, por defecto false)
export const validarCrearTarea = [
  validarNombre,
  body("completada")
    .isBoolean()
    .withMessage("completada debe ser true o false")
    .toBoolean()
    .optional(),
];

// Validacion para modificar tarea (todos los campos son obligatorios)
export const validarModificarTarea = [
  validarNombre,
  body("completada")
    .exists()
    .withMessage("completada es obligatorio")
    .bail()
    .isBoolean()
    .withMessage("completada debe ser true o false")
    .toBoolean(),
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