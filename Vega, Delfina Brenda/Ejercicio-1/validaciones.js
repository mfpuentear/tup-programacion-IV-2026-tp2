import { body, param, query, validationResult } from "express-validator";

export const validarId = param("id")
.isInt({ min: 1 })
.withMessage("id debe ser un entero positivo");

//validacion de filtros del listado
export const validarFiltrosRectangulos = [
    query("superficieMin")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("superficieMin debe ser un numero mayor o igual a 0"),
    query("superficieMax")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("superficieMax debe ser un numero mayor o igual a 0"),

];

// Un lado: obligatorio numerico, mayor que cero y con hasta 2 decimales
const validarLado = (campo) =>
    body(campo)
.exists({ values: "null" })
.withMessage(`${campo} es obligatorio`)
.bail()
.isFloat({ gt: 0, lt: 100000000 })
.withMessage(`${campo} debe ser un numero mayor que cero y menor que 100000000`)
.bail()
.isDecimal({ decimal_digits: "0,2"})
.withMessage(`${campo} admite como maximo 2 decimales`);

//Validacion de rectangulo al momento de crear y modificar
export const validarRectangulo = [
    validarLado("ladoA"),
    validarLado("ladoB"),

    //El usuario no puede enviar valores calculados
    body(["perimetro", "superficie"])
    .not()
    .exists()
    .withMessage("No se permite enviar este campo, se calcula en el servidor"),
];

//Middleware para verificar las validaciones
export const verificarValidaciones= (req, res, next) => {
    const resultadoValidacion = validationResult(req);
    if (!resultadoValidacion.isEmpty()) {
        return res.status(400).json({
            mensaje: "Parametros no validos",
            errores: resultadoValidacion.array(),

        });
    }
    next()
};