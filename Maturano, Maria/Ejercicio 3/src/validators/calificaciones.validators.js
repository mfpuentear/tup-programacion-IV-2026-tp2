import { body, param, query } from "express-validator";
import { pool } from "../db.js";
import {
  MENSAJE_DUPLICADO,
  MENSAJE_ALUMNO_INEXISTENTE,
  MENSAJE_MATERIA_INEXISTENTE,
} from "../middlewares/validar.js";

const esIdValido = (valor) =>
  Number.isInteger(valor) && valor >= 1 && valor <= 4294967295;

export const validarId = [
  param("id")
    .isInt({ min: 1, max: 4294967295 })
    .withMessage("id debe ser un entero positivo válido"),
];

export const validarFiltro = [
  query("alumno_id")
    .optional()
    .isInt({ min: 1, max: 4294967295 })
    .withMessage("alumno_id debe ser un entero positivo válido"),
  query("materia_id")
    .optional()
    .isInt({ min: 1, max: 4294967295 })
    .withMessage("materia_id debe ser un entero positivo válido"),
];

export const validarCuerpo = [
  body("alumno_id")
    .exists().withMessage("alumno_id es obligatorio").bail()
    .custom(esIdValido).withMessage("alumno_id debe ser un entero positivo válido").bail()
    .custom(async (alumnoId) => {
      const [filas] = await pool.query("SELECT id FROM alumnos WHERE id = ?", [
        alumnoId,
      ]);
      if (filas.length === 0) throw new Error(MENSAJE_ALUMNO_INEXISTENTE);
    }),

  body("materia_id")
    .exists().withMessage("materia_id es obligatorio").bail()
    .custom(esIdValido).withMessage("materia_id debe ser un entero positivo válido").bail()
    .custom(async (materiaId) => {
      const [filas] = await pool.query("SELECT id FROM materias WHERE id = ?", [
        materiaId,
      ]);
      if (filas.length === 0) throw new Error(MENSAJE_MATERIA_INEXISTENTE);
    }).bail()
    .custom(async (materiaId, { req }) => {
      const alumnoId = req.body.alumno_id;
      if (!esIdValido(alumnoId)) return;
      const idActual = Number(req.params?.id) || 0;
      const [filas] = await pool.query(
        "SELECT id FROM calificaciones WHERE alumno_id = ? AND materia_id = ? AND id <> ?",
        [alumnoId, materiaId, idActual]
      );
      if (filas.length > 0) throw new Error(MENSAJE_DUPLICADO);
    }),

  body("notas")
    .exists().withMessage("notas es obligatorio").bail()
    .isArray().withMessage("notas debe ser un arreglo").bail()
    .custom((notas) => notas.length === 3)
    .withMessage("notas debe tener exactamente 3 elementos"),

  body("notas.*")
    .custom((nota) => typeof nota === "number" && Number.isFinite(nota))
    .withMessage("cada nota debe ser un número").bail()
    .isFloat({ min: 0, max: 10 })
    .withMessage("cada nota debe estar entre 0 y 10").bail()
    .custom((nota) => /^\d+(\.\d{1,2})?$/.test(String(nota)))
    .withMessage("cada nota admite como máximo 2 decimales"),
];