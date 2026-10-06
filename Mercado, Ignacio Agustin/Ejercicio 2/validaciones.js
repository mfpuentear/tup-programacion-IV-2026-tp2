import { body, param, query, validationResult } from "express-validator";
import { db } from "./db.js";

// Normaliza el texto: quita espacios a los extremos y comprime espacios dobles intermedios
export const normalizarTexto = (texto) => texto.trim().replace(/\s+/g, " ");

export const validarId = param("id")
  .isInt({ min: 1 })
  .withMessage("El ID debe ser un número entero positivo");

export const validarConsultaEstado = [
  query("completada")
    .optional()
    .isIn(["true", "false", "1", "0"])
    .withMessage("El filtro 'completada' debe ser un valor booleano válido (true, false, 1 o 0)"),
];

export const validarCrearTarea = [
  body("nombre")
    .exists({ checkNull: true })
    .withMessage("El campo 'nombre' es obligatorio")
    .bail()
    .isString()
    .withMessage("El campo 'nombre' debe ser una cadena de texto")
    .bail()
    .trim()
    .notEmpty()
    .withMessage("El campo 'nombre' no puede estar vacío")
    .bail()
    .customSanitizer(normalizarTexto)
    .custom(async (nombreIngresado) => {
      // Verificación de unicidad insensible a mayúsculas/minúsculas y espacios
      const [filas] = await db.execute(
        "SELECT id FROM tareas WHERE LOWER(nombre) = LOWER(?)",
        [nombreIngresado]
      );
      if (filas.length > 0) {
        throw new Error(`Ya existe una tarea registrada con el nombre '${nombreIngresado}'`);
      }
      return true;
    }),
  body("completada")
    .optional()
    .isBoolean()
    .withMessage("El campo 'completada' debe ser booleano (true o false)"),
];

export const validarActualizarTarea = [
  validarId,
  body("nombre")
    .optional()
    .isString()
    .withMessage("El campo 'nombre' debe ser una cadena de texto")
    .bail()
    .trim()
    .notEmpty()
    .withMessage("El campo 'nombre' no puede estar vacío")
    .bail()
    .customSanitizer(normalizarTexto)
    .custom(async (nombreIngresado, { req }) => {
      const id = req.params.id;
      const [filas] = await db.execute(
        "SELECT id FROM tareas WHERE LOWER(nombre) = LOWER(?) AND id != ?",
        [nombreIngresado, id]
      );
      if (filas.length > 0) {
        throw new Error(`Ya existe otra tarea registrada con el nombre '${nombreIngresado}'`);
      }
      return true;
    }),
  body("completada")
    .optional()
    .isBoolean()
    .withMessage("El campo 'completada' debe ser booleano (true o false)"),
];

export const verificarValidaciones = (req, res, next) => {
  const errores = validationResult(req);
  if (!errores.isEmpty()) {
    return res.status(400).json({
      mensaje: "Parámetros o datos no válidos",
      errores: errores.array(),
    });
  }
  next();
};