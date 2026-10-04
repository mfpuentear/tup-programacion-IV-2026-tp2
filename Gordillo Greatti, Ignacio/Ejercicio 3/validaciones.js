import { body, param, validationResult } from "express-validator";

export const verificarValidaciones = (req, res, next) => {
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
        return res.status(400).json({ errores: errores.array() });
    }
    next();
};

export const validarId = param("id")
    .isInt({ min: 1 })
    .withMessage("El id tiene que ser un entero positivo")
    .toInt();

// texto sin espacios de más, entre 3 y 100 caracteres
// es función para que alumnos y materias le agreguen sus propias reglas
export const validarNombre = () =>
    body("nombre")
        .exists()
        .withMessage("Falta el nombre")
        .bail()
        .isString()
        .withMessage("El nombre tiene que ser texto")
        .bail()
        .trim()
        .customSanitizer((nombre) => nombre.replace(/\s+/g, " "))
        .isLength({ min: 3, max: 100 })
        .withMessage("El nombre tiene que tener entre 3 y 100 caracteres");