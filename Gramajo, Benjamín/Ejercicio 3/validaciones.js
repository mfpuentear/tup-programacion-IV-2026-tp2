import { body, param, validationResult } from "express-validator";

export const validarId = param("id").isInt({ min: 1 });

export const validarMateria = [
  body("nombre")
    .trim()
    .notEmpty()
    .withMessage("El nombre de la materia es obligatorio")
    .isLength({ min: 1, max: 100 })
    .withMessage("El nombre debe tener entre 1 y 100 caracteres"),
];

export const validarCalificacion = [
  body("alumno")
    .trim()
    .notEmpty()
    .withMessage("El nombre del alumno es obligatorio")
    .isLength({ min: 1, max: 100 })
    .withMessage("El nombre del alumno debe tener entre 1 y 100 caracteres"),
  body("materiaId")
    .isInt({ min: 1 })
    .withMessage("materiaId debe ser un número entero positivo"),
  body("nota1")
    .isFloat({ min: 1, max: 10 })
    .withMessage("nota1 debe estar entre 1 y 10"),
  body("nota2")
    .isFloat({ min: 1, max: 10 })
    .withMessage("nota2 debe estar entre 1 y 10"),
  body("nota3")
    .isFloat({ min: 1, max: 10 })
    .withMessage("nota3 debe estar entre 1 y 10"),
];

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
