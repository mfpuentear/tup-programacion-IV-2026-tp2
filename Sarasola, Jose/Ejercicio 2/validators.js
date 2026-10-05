const { body, param, query, validationResult } = require("express-validator");

function responderErroresValidacion(req, res, next) {
  const errores = validationResult(req);

  if (!errores.isEmpty()) {
    return res.status(400).json({
      error: "Datos inválidos.",
      detalles: errores.array().map((e) => ({ campo: e.path, mensaje: e.msg })),
    });
  }

  next();
}

function soloCamposBody(camposPermitidos) {
  return (req, res, next) => {
    const extras = Object.keys(req.body || {}).filter(
      (campo) => !camposPermitidos.includes(campo)
    );

    if (extras.length > 0) {
      return res.status(400).json({
        error: `Campos no permitidos: ${extras.join(", ")}.`,
      });
    }

    next();
  };
}

function soloQuery(camposPermitidos) {
  return (req, res, next) => {
    const extras = Object.keys(req.query || {}).filter(
      (campo) => !camposPermitidos.includes(campo)
    );

    if (extras.length > 0) {
      return res.status(400).json({
        error: `Parámetros de consulta no permitidos: ${extras.join(", ")}.`,
      });
    }

    next();
  };
}

const validarId = [
  param("id")
    .isInt({ min: 1 })
    .withMessage("El id debe ser un entero positivo.")
    .toInt(),
  responderErroresValidacion,
];

const validarTarea = [
  body("nombre")
    .exists({ checkNull: true })
    .withMessage("El nombre es obligatorio.")
    .bail()
    .isString()
    .withMessage("El nombre debe ser texto.")
    .bail()
    .trim()
    .notEmpty()
    .withMessage("El nombre no puede estar vacío.")
    .bail()
    .isLength({ max: 120 })
    .withMessage("El nombre no puede superar 120 caracteres."),
  body("completada")
    .exists({ checkNull: true })
    .withMessage("completada es obligatorio.")
    .bail()
    .custom((valor) => typeof valor === "boolean")
    .withMessage("completada debe ser un booleano JSON: true o false."),
  responderErroresValidacion,
];

const validarFiltroEstado = [
  query("estado")
    .optional()
    .isIn(["completadas", "pendientes"])
    .withMessage("estado debe ser 'completadas' o 'pendientes'."),
  responderErroresValidacion,
];

module.exports = {
  soloCamposBody,
  soloQuery,
  validarId,
  validarTarea,
  validarFiltroEstado,
};
