import { body, param, query, validationResult } from "express-validator";

// Validacion del filtro por estado del listado
export const validarFiltrosTareas = [
  query("estado").isIn(["completada", "pendiente"]).optional(),
];

// Validacion de id en params
export const validarId = param("id").isInt({ min: 1 });

// Validacion para crear (POST): completada es opcional, nace pendiente
export const validarTareaNueva = [
  body("nombre")
    .isString()
    .withMessage("nombre debe ser un texto")
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("nombre debe tener entre 1 y 100 caracteres"),
  body("completada").isBoolean().withMessage("completada debe ser true o false").optional(),
];

// Validacion para reemplazo completo (PUT): ambos obligatorios
export const validarTareaCompleta = [
  body("nombre")
    .isString()
    .withMessage("nombre debe ser un texto")
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("nombre debe tener entre 1 y 100 caracteres"),
  body("completada").isBoolean().withMessage("completada debe ser true o false"),
];

// Validacion para modificacion parcial (PATCH): cada campo opcional,
// pero al menos uno presente
export const validarTareaParcial = [
  body("nombre")
    .isString()
    .withMessage("nombre debe ser un texto")
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("nombre debe tener entre 1 y 100 caracteres")
    .optional(),
  body("completada")
    .isBoolean()
    .withMessage("completada debe ser true o false")
    .optional(),
  body().custom((value, { req }) => {
    if (req.body.nombre === undefined && req.body.completada === undefined) {
      throw new Error("Debe enviar al menos nombre o completada");
    }
    return true;
  }),
];

// Middleware para verificar validaciones
export const verificarValidaciones = (req, res, next) => {
  const resultadoValidacion = validationResult(req);
  if (!resultadoValidacion.isEmpty()) {
    return res.status(400).send({
      mensaje: "Parametros no validos",
      errores: resultadoValidacion.array(),
    });
  }
  next();
};