import { body, param, query } from "express-validator";
import { pool } from "../db.js";

export const MENSAJE_DUPLICADO = "Ya existe una tarea con ese nombre";

// Criterio de igualdad: sin espacios al borde, espacios repetidos reducidos a uno.
// La comparación sin distinguir mayúsculas ni acentos la hace la colación de la columna.
const normalizarNombre = (valor) =>
  typeof valor === "string" ? valor.replace(/\s+/g, " ").trim() : valor;

const validarNombre = body("nombre")
  .exists().withMessage("nombre es obligatorio").bail()
  .isString().withMessage("nombre debe ser texto").bail()
  .customSanitizer(normalizarNombre)
  .notEmpty().withMessage("nombre no puede estar vacío").bail()
  .isLength({ max: 100 }).withMessage("nombre admite como máximo 100 caracteres").bail()
  .custom(async (nombre, { req }) => {
    // En el POST no hay id y se usa 0, que ninguna tarea tiene; en el PUT se excluye la propia.
    const idActual = Number(req.params?.id) || 0;
    const [filas] = await pool.query(
      "SELECT id FROM tareas WHERE nombre = ? AND id <> ?",
      [nombre, idActual]
    );
    if (filas.length > 0) {
      throw new Error(MENSAJE_DUPLICADO);
    }
  });

const validarCompletada = body("completada")
  .optional()
  .custom((valor) => typeof valor === "boolean")
  .withMessage("completada debe ser true o false");

export const validarCreacion = [validarNombre, validarCompletada];

export const validarId = [
  param("id")
    .isInt({ min: 1, max: 4294967295 })
    .withMessage("id debe ser un número entero positivo"),
];

export const ESTADOS = ["completadas", "pendientes"];

export const validarFiltro = [
  query("estado")
    .optional()
    .isString().withMessage("estado debe ser un único valor").bail()
    .isIn(ESTADOS)
    .withMessage(`estado debe ser uno de: ${ESTADOS.join(", ")}`),
];

const validarCompletadaObligatoria = body("completada")
  .exists().withMessage("completada es obligatorio").bail()
  .custom((valor) => typeof valor === "boolean")
  .withMessage("completada debe ser true o false");

export const validarModificacion = [validarNombre, validarCompletadaObligatoria];