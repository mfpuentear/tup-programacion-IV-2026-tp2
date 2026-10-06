import { body, param, query, validationResult } from "express-validator";

export const validarId = [
    param("id")
        .isInt({ min: 1 })
        .withMessage("El id debe ser un numero entero mayor a 0")
];

export const validarFiltrosRectangulos = [
    query("ladoMin")
        .optional()
        .isFloat({ gt: 0 })
        .withMessage("ladoMin debe ser un numero mayor a 0"),

    query("ladoMax")
        .optional()
        .isFloat({ gt: 0 })
        .withMessage("ladoMax debe ser un numero mayor a 0")
];

export const validarRectangulo = [
    body("ladoA")
        .exists()
        .withMessage("ladoA es obligatorio")
        .bail()
        .isFloat({ gt: 0 })
        .withMessage("ladoA debe ser un numero mayor a 0"),

    body("ladoB")
        .exists()
        .withMessage("ladoB es obligatorio")
        .bail()
        .isFloat({ gt: 0 })
        .withMessage("ladoB debe ser un numero mayor a 0"),

    body("perimetro")
        .not()
        .exists()
        .withMessage("El perimetro no debe enviarse, se calcula en el servidor"),

    body("superficie")
        .not()
        .exists()
        .withMessage("La superficie no debe enviarse, se calcula en el servidor")
];

export function verificarValidaciones(req, res, next) {
    const resultado = validationResult(req);

    if (!resultado.isEmpty()) {
        return res.status(400).json({
        mensaje: "Datos no validos",
        errores: resultado.array()
        });
    }

    next();
}