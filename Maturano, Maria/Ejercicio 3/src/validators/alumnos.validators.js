import { body, param } from "express-validator";
import { pool } from "../db.js";
import { MENSAJE_DUPLICADO } from "../middlewares/validar.js";

const normalizarNombre = (valor) =>
  typeof valor === "string" ? valor.replace(/\s+/g, " ").trim() : valor;

export const validarId = [
  param("id")
    .isInt({ min: 1, max: 4294967295 })
    .withMessage("id debe ser un entero positivo válido"),
];

export const validarCuerpo = [
  body("nombre")
    .exists().withMessage("nombre es obligatorio").bail()
    .isString().withMessage("nombre debe ser texto").bail()
    .customSanitizer(normalizarNombre)
    .notEmpty().withMessage("nombre no puede estar vacío").bail()
    .isLength({ max: 100 }).withMessage("nombre admite como máximo 100 caracteres").bail()
    .matches(/^\p{L}[\p{L} '.-]*$/u)
    .withMessage("nombre solo admite letras, espacios, apóstrofes, puntos y guiones").bail()
    .custom(async (nombre, { req }) => {
      const idActual = Number(req.params?.id) || 0;
      const [filas] = await pool.query(
        "SELECT id FROM alumnos WHERE nombre = ? AND id <> ?",
        [nombre, idActual]
      );
      if (filas.length > 0) throw new Error(MENSAJE_DUPLICADO);
    }),
];