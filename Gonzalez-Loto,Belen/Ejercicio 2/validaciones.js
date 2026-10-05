import { body, param, query, validationResult } from "express-validator";
import { db } from "./db.js";

function normalizarNombre(nombre) {
    return nombre.trim().toLowerCase();
}

async function existeTareaConNombre(nombre, idActual = null) {
    const nombreNormalizado = normalizarNombre(nombre);

    let sql = "SELECT id FROM tareas WHERE nombre_normalizado = ?";
    const valores = [nombreNormalizado];

    if (idActual !== null) {
        sql += " AND id <> ?";
        valores.push(idActual);
    }

    const [tareas] = await db.execute(sql, valores);

    return tareas.length > 0;
}

export const validarId = [
    param("id")
        .isInt({ min: 1 })
        .withMessage("El id debe ser un numero entero mayor a 0")
];

export const validarFiltroEstado = [
    query("estado")
        .optional()
        .isIn(["completadas", "pendientes"])
        .withMessage("El estado debe ser completadas o pendientes")
];

export const validarTarea = [
    body("nombre")
        .exists()
        .withMessage("El nombre es obligatorio")
        .bail()
        .isString()
        .withMessage("El nombre debe ser un texto")
        .bail()
        .trim()
        .isLength({ min: 3, max: 60 })
        .withMessage("El nombre debe tener entre 3 y 60 caracteres")
        .bail()
        .custom(async (nombre, { req }) => {
            const idActual = req.params.id ? Number(req.params.id) : null;

        if (await existeTareaConNombre(nombre, idActual)) {
            throw new Error("Ya existe una tarea con ese nombre");
        }

        return true;
    }),

    body("completada")
        .exists()
        .withMessage("El estado completada es obligatorio")
        .bail()
        .isBoolean()
        .withMessage("completada debe ser un valor booleano")
];

export const validarEstadoParcial = [
    body("completada")
        .exists()
        .withMessage("El estado completada es obligatorio")
        .bail()
        .isBoolean()
        .withMessage("completada debe ser un valor booleano")
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