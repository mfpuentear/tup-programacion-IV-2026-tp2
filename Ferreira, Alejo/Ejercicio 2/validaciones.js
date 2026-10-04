import { body, param, query, validationResult } from "express-validator";
import { db } from "./db.js";

// Valida que el id de la URL sea un entero positivo
export const validarId = param("id")
  .isInt({ min: 1 })
  .withMessage("El id debe ser un número entero mayor a 0");

// Valida el filtro por estado del listado
export const validarFiltros = [
  query("estado")
    .optional()
    .isIn(["completadas", "pendientes"])
    .withMessage('estado debe ser "completadas" o "pendientes"'),
];

// Reglas del nombre (se usan al crear y al modificar)
const reglasNombre = () =>
  body("nombre")
    .exists()
    .withMessage("El nombre es obligatorio")
    .bail()
    .isString()
    .withMessage("El nombre debe ser un texto")
    .bail()
    .trim()
    .customSanitizer((nombre) => nombre.replace(/\s+/g, " "))
    .notEmpty()
    .withMessage("El nombre no puede estar vacío")
    .bail()
    .isLength({ max: 100 })
    .withMessage("El nombre puede tener hasta 100 caracteres")
    .bail()
    .custom(async (nombre, { req }) => {
      // Al modificar, se excluye la propia tarea de la búsqueda
      const id = Number(req.params.id) || 0;
      const [tareas] = await db.execute(
        "SELECT id FROM tareas WHERE nombre = ? AND id <> ?",
        [nombre, id],
      );
      if (tareas.length > 0) {
        throw new Error("Ya existe una tarea con ese nombre");
      }
    });

// Regla del estado: solo se acepta true o false (booleano real)
const esBooleano = (valor) => typeof valor === "boolean";

// Al crear, "completada" es opcional (por defecto es false)
export const validarCrearTarea = [
  reglasNombre(),
  body("completada")
    .optional()
    .custom(esBooleano)
    .withMessage("completada debe ser true o false"),
];

// Al modificar (PUT), se reciben todos los datos
export const validarModificarTarea = [
  reglasNombre(),
  body("completada")
    .exists()
    .withMessage("completada es obligatorio")
    .bail()
    .custom(esBooleano)
    .withMessage("completada debe ser true o false"),
];

// Middleware que corta la petición si alguna validación falló
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