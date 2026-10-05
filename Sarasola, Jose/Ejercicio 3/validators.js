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

const validarMateria = [
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
  responderErroresValidacion,
];

const validarCalificacion = [
  body("alumno")
    .exists({ checkNull: true })
    .withMessage("El nombre del alumno es obligatorio.")
    .bail()
    .isString()
    .withMessage("El nombre del alumno debe ser texto.")
    .bail()
    .trim()
    .notEmpty()
    .withMessage("El nombre del alumno no puede estar vacío.")
    .bail()
    .isLength({ max: 120 })
    .withMessage("El nombre del alumno no puede superar 120 caracteres."),
  body("materiaId")
    .exists({ checkNull: true })
    .withMessage("materiaId es obligatorio.")
    .bail()
    .isInt({ min: 1 })
    .withMessage("materiaId debe ser un entero positivo.")
    .toInt(),
  body("notas")
    .exists({ checkNull: true })
    .withMessage("Las notas son obligatorias.")
    .bail()
    .isArray({ min: 3, max: 3 })
    .withMessage("Deben informarse exactamente tres notas."),
  body("notas.*")
  .custom(
    (valor) =>
      typeof valor === "number" &&
      Number.isFinite(valor) &&
      valor >= 0 &&
      valor <= 10
  )
  .withMessage("Cada nota debe ser un número entre 0 y 10.")
  .bail()
  .custom((valor) => /^\d+(\.\d{1,2})?$/.test(String(valor)))
  .withMessage("Cada nota puede tener como máximo dos decimales."),
  responderErroresValidacion,
];

const validarFiltroMateria = [
  query("materiaId")
    .optional()
    .isInt({ min: 1 })
    .withMessage("materiaId debe ser un entero positivo.")
    .toInt(),
  responderErroresValidacion,
];

module.exports = {
  soloCamposBody,
  soloQuery,
  validarId,
  validarMateria,
  validarCalificacion,
  validarFiltroMateria,
};
