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

// validar rectangulo
export const validarRectangulo = [
  body("ladoA")
    .exists()
    .withMessage("El ladoA es requerido")
    .isFloat({ gt: 0 })
    .withMessage("El ladoA debe ser un número mayor a cero"),
  body("ladoB")
    .exists()
    .withMessage("El ladoB es requerido")
    .isFloat({ gt: 0 })
    .withMessage("El ladoB debe ser un número mayor a cero"),
  // que no manden perimetro ni superficie
  body("perimetro")
    .not()
    .exists()
    .withMessage("El perímetro no debe ser enviado por el cliente; lo calcula el servidor"),
  body("superficie")
    .not()
    .exists()
    .withMessage("La superficie no debe ser enviada por el cliente; la calcula el servidor"),
  body().custom((value, { req }) => {
    const camposPermitidos = ["ladoA", "ladoB", "perimetro", "superficie"];
    const desconocidos = Object.keys(req.body).filter((c) => !camposPermitidos.includes(c));
    if (desconocidos.length > 0) {
      throw new Error(`Campos no permitidos: ${desconocidos.join(", ")}`);
    }
    return true;
  }),
];

// validar filtros
export const validarFiltrosRectangulos = [
  query("superficieMin")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("superficieMin debe ser un número mayor o igual a cero"),
  query("superficieMax")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("superficieMax debe ser un número mayor o igual a cero"),
  query("limit")
    .optional()
    .isInt({ min: 1 })
    .withMessage("limit debe ser un entero positivo"),
  query("offset")
    .optional()
    .isInt({ min: 0 })
    .withMessage("offset debe ser un entero mayor o igual a cero"),
];
