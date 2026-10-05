import { body, param, validationResult } from "express-validator";

//validar alumno
export const validarAlumno = [
  body("nombre")
    .notEmpty().withMessage("se necesita el nombre del alumno")
    .isLength({ min: 2 }).withMessage("el nombre debe ser valido"),
];

// validar materia
export const validarMateria = [
  body("nombre")
    .notEmpty().withMessage("se necesita el nombre de la materia")
    .isLength({ min: 2 }).withMessage("el nombre debe ser valido"),
];

// validar nota
export const validarNota = [
  body("alumno_id").isInt({ min: 1 }).withMessage("el alumno debe existir y ser valido"),
  body("materia_id").isInt({ min: 1 }).withMessage("la materia debe existir y ser valida"),
  body("nota1").isInt({ min: 1, max: 10 }).withMessage("la nota1 debe estar entre 1 y 10"),
  body("nota2").isInt({ min: 1, max: 10 }).withMessage("la nota2 debe estar entre 1 y 10"),
  body("nota3").isInt({ min: 1, max: 10 }).withMessage("la nota3 debe estar entre 1 y 10"),
];

// validar id
export const validarId = param("id")
  .isInt({ min: 1 })
  .withMessage("el ID debe ser un numero entero positivo");

export const verificarValidaciones = (req, res, next) => {
  const resultado = validationResult(req);
  if (!resultado.isEmpty()) {
    return res.status(400).json({
      mensaje: "Parametros no validos",
      errores: resultado.array(),
    });
  }
  next();
};
