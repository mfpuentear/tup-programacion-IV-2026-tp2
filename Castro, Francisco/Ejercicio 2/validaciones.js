import { body, param, query, validationResult } from "express-validator";

// revisar validaciones
export const verificarValidaciones = (req, res, next) => {
  const validacion = validationResult(req);
  if (!validacion.isEmpty()) {
    return res.status(400).send({ errores: validacion.array() });
  }
  next();
};

// validar id
export const validarId = [
  param("id")
    .isInt({ min: 1 })
    .withMessage("El id debe ser un número entero positivo"),
];

// validar tarea
export const validarTarea = [
  body("nombre")
    .exists()
    .withMessage("El nombre es requerido")
    .isString()
    .withMessage("El nombre debe ser un texto")
    .trim()
    .notEmpty()
    .withMessage("El nombre no puede estar vacío")
    .isLength({ max: 45 })
    .withMessage("El nombre no puede superar los 45 caracteres"),
  body("estado")
    .optional()
    .custom((valor) => typeof valor === "boolean")
    .withMessage("El estado debe ser un booleano (true para completada, false para pendiente)"),
  body().custom((value, { req }) => {
    const camposPermitidos = ["nombre", "estado"];
    const desconocidos = Object.keys(req.body).filter((c) => !camposPermitidos.includes(c));
    if (desconocidos.length > 0) {
      throw new Error(`Campos no permitidos: ${desconocidos.join(", ")}`);
    }
    return true;
  }),
];

// validar filtros
export const validarFiltrosTareas = [
  query("estado")
    .optional()
    .isIn(["completadas", "pendientes"])
    .withMessage("El filtro estado debe ser 'completadas' o 'pendientes'"),
  query("limit")
    .optional()
    .isInt({ min: 1 })
    .withMessage("limit debe ser un entero positivo"),
  query("offset")
    .optional()
    .isInt({ min: 0 })
    .withMessage("offset debe ser un entero mayor o igual a cero"),
];
