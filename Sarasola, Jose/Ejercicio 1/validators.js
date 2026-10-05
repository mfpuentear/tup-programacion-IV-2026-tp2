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

const validarRectangulo = [
  body("lado1")
    .exists({ checkNull: true })
    .withMessage("lado1 es obligatorio.")
    .bail()
    .custom((valor) => typeof valor === "number")
    .withMessage("lado1 debe ser un número.")
    .bail()
    .custom((valor) => Number.isFinite(valor))
    .withMessage("lado1 debe ser un número finito.")
    .bail()
    .custom((valor) => valor > 0)
    .withMessage("lado1 debe ser mayor que cero.")
    .bail()
    .custom((valor) => valor <= 99999999.99)
    .withMessage("lado1 no puede ser mayor que 99999999.99.")
    .bail()
    .custom((valor) => /^\d+(\.\d{1,2})?$/.test(String(valor)))
    .withMessage("lado1 puede tener como máximo dos decimales."),

  body("lado2")
    .exists({ checkNull: true })
    .withMessage("lado2 es obligatorio.")
    .bail()
    .custom((valor) => typeof valor === "number")
    .withMessage("lado2 debe ser un número.")
    .bail()
    .custom((valor) => Number.isFinite(valor))
    .withMessage("lado2 debe ser un número finito.")
    .bail()
    .custom((valor) => valor > 0)
    .withMessage("lado2 debe ser mayor que cero.")
    .bail()
    .custom((valor) => valor <= 99999999.99)
    .withMessage("lado2 no puede ser mayor que 99999999.99.")
    .bail()
    .custom((valor) => /^\d+(\.\d{1,2})?$/.test(String(valor)))
    .withMessage("lado2 puede tener como máximo dos decimales."),

  responderErroresValidacion,
];

const validarFiltroCuadrado = [
  query("cuadrado")
    .optional()
    .isIn(["true", "false"])
    .withMessage("cuadrado debe ser 'true' o 'false'."),
  responderErroresValidacion,
];

module.exports = {
  responderErroresValidacion,
  soloCamposBody,
  soloQuery,
  validarId,
  validarRectangulo,
  validarFiltroCuadrado,
};
