import { body, param } from "express-validator";

const validarLado = (campo) =>
  body(campo)
    .exists().withMessage(`${campo} es obligatorio`).bail()
    .custom((v) => typeof v === "number" && Number.isFinite(v))
    .withMessage(`${campo} debe ser un número`).bail()
    .custom((v) => v > 0).withMessage(`${campo} debe ser mayor que cero`).bail()
    .custom((v) => v <= 1000000000)
    .withMessage(`${campo} no puede superar 1000000000`).bail()
    .custom((v) => Math.round(v * 100) / 100 === v)
    .withMessage(`${campo} admite como máximo 2 decimales`);

const rechazarCalculados = body(["perimetro", "superficie"])
  .not().exists()
  .withMessage("perimetro y superficie no se envían: los calcula el servidor");

export const validarCreacion = [
  rechazarCalculados,
  validarLado("lado_a"),
  validarLado("lado_b"),
];

export const validarId = [
  param("id")
    .isInt({ min: 1, max: 4294967295 })
    .withMessage("id debe ser un número entero positivo"),
];