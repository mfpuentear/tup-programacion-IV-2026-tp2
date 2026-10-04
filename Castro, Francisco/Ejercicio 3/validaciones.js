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

// validar materia
export const validarMateria = [
  body("nombre")
    .exists()
    .withMessage("El nombre de la materia es requerido")
    .isString()
    .withMessage("El nombre debe ser un texto")
    .trim()
    .notEmpty()
    .withMessage("El nombre de la materia no puede estar vacío")
    .isLength({ max: 45 })
    .withMessage("El nombre de la materia no puede superar los 45 caracteres"),
  body().custom((value, { req }) => {
    const desconocidos = Object.keys(req.body).filter((c) => c !== "nombre");
    if (desconocidos.length > 0) {
      throw new Error(`Campos no permitidos: ${desconocidos.join(", ")}`);
    }
    return true;
  }),
];

// validar filtros de materias
export const validarFiltrosMaterias = [
  query("buscar")
    .optional()
    .isString()
    .trim()
    .notEmpty()
    .withMessage("El parámetro de búsqueda no puede estar vacío"),
  query("limit")
    .optional()
    .isInt({ min: 1 })
    .withMessage("limit debe ser un entero positivo"),
  query("offset")
    .optional()
    .isInt({ min: 0 })
    .withMessage("offset debe ser un entero mayor o igual a cero"),
];

// validar calificacion (3 notas de 1 a 10)
export const validarCalificacion = [
  body("alumno")
    .exists()
    .withMessage("El nombre del alumno es requerido")
    .isString()
    .withMessage("El nombre del alumno debe ser un texto")
    .trim()
    .notEmpty()
    .withMessage("El nombre del alumno no puede estar vacío")
    .isLength({ max: 45 })
    .withMessage("El nombre del alumno no puede superar los 45 caracteres"),
  body("materiaId")
    .exists()
    .withMessage("El materiaId es requerido")
    .isInt({ min: 1 })
    .withMessage("El materiaId debe ser un número entero positivo"),
  body("notas")
    .exists()
    .withMessage("Las notas son requeridas")
    .isArray({ min: 3, max: 3 })
    .withMessage("Se deben enviar exactamente tres notas (un arreglo de 3 elementos)"),
  body("notas.*")
    .isInt({ min: 1, max: 10 })
    .withMessage("Cada nota debe ser un número entero dentro de la escala de 1 a 10"),
  body().custom((value, { req }) => {
    const camposPermitidos = ["alumno", "materiaId", "notas"];
    const desconocidos = Object.keys(req.body).filter((c) => !camposPermitidos.includes(c));
    if (desconocidos.length > 0) {
      throw new Error(`Campos no permitidos: ${desconocidos.join(", ")}`);
    }
    return true;
  }),
];

// validar modificacion parcial (patch)
export const validarCalificacionParcial = [
  body("alumno")
    .optional()
    .isString()
    .withMessage("El nombre del alumno debe ser un texto")
    .trim()
    .notEmpty()
    .withMessage("El nombre del alumno no puede estar vacío")
    .isLength({ max: 45 })
    .withMessage("El nombre del alumno no puede superar los 45 caracteres"),
  body("materiaId")
    .optional()
    .isInt({ min: 1 })
    .withMessage("El materiaId debe ser un número entero positivo"),
  body("notas")
    .optional()
    .isArray({ min: 3, max: 3 })
    .withMessage("Se deben enviar exactamente tres notas (un arreglo de 3 elementos)"),
  body("notas.*")
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage("Cada nota debe ser un número entero dentro de la escala de 1 a 10"),
  body().custom((value, { req }) => {
    const camposPermitidos = ["alumno", "materiaId", "notas"];
    const camposRecibidos = Object.keys(req.body);
    if (camposRecibidos.length === 0) {
      throw new Error("Debe enviar al menos un campo para actualizar");
    }
    const desconocidos = camposRecibidos.filter((c) => !camposPermitidos.includes(c));
    if (desconocidos.length > 0) {
      throw new Error(`Campos no permitidos: ${desconocidos.join(", ")}`);
    }
    return true;
  }),
];

// validar filtros de calificaciones
export const validarFiltrosCalificaciones = [
  query("alumno")
    .optional()
    .isString()
    .trim()
    .notEmpty()
    .withMessage("El filtro de alumno no puede estar vacío"),
  query("materiaId")
    .optional()
    .isInt({ min: 1 })
    .withMessage("materiaId debe ser un entero positivo"),
  query("limit")
    .optional()
    .isInt({ min: 1 })
    .withMessage("limit debe ser un entero positivo"),
  query("offset")
    .optional()
    .isInt({ min: 0 })
    .withMessage("offset debe ser un entero mayor o igual a cero"),
];
