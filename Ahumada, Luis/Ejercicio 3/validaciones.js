import { body, param, validationResult } from "express-validator";

export const validarId = [
  param("id")
    .isInt({ min: 1 })
    .withMessage("El id debe ser un número entero mayor a 0"),
];

export const validarMateria = [
  body("Nombre")
    .trim()
    .notEmpty()
    .withMessage("El nombre de la materia es obligatorio")
    .isLength({ max: 100 })
    .withMessage("El nombre de la materia no puede superar los 100 caracteres"),
];

export const validarCalificacion = [
  body("Nombre_Alumno")
    .trim()
    .notEmpty()
    .withMessage("El nombre del alumno es obligatorio")
    .isLength({ max: 100 })
    .withMessage("El nombre del alumno no puede superar los 100 caracteres"),

  body("Materia_Id")
    .isInt({ min: 1 })
    .withMessage("Materia_Id debe ser un número entero mayor a 0"),

  body("Nota_1")
    .isFloat({ min: 0, max: 10 })
    .withMessage("La Nota_1 debe ser un número entre 0 y 10"),

  body("Nota_2")
    .isFloat({ min: 0, max: 10 })
    .withMessage("La Nota_2 debe ser un número entre 0 y 10"),

  body("Nota_3")
    .isFloat({ min: 0, max: 10 })
    .withMessage("La Nota_3 debe ser un número entre 0 y 10"),
];

export const verificarValidaciones = (req, res, next) => {
  const errores = validationResult(req);

  if (!errores.isEmpty()) {
    return res.status(400).send({
      errores: errores.array(),
    });
  }

  next();
};