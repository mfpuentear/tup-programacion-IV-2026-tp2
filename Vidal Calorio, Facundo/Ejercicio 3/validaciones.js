import { body, param, query, validationResult } from "express-validator";
import { db } from "./db.js";

function normalizarTexto(texto) {
    return texto.trim().toLowerCase();
}

async function existeMateria(id) {
    const [materias] = await db.execute("SELECT id FROM materias WHERE id = ?", [
        id
    ]);

    return materias.length > 0;
}

async function existeMateriaConNombre(nombre) {
    const nombreNormalizado = normalizarTexto(nombre);

    const [materias] = await db.execute(
        "SELECT id FROM materias WHERE nombre_normalizado = ?",
        [nombreNormalizado]
    );

    return materias.length > 0;
}

async function existeCalificacion(alumnoNombre, materiaId, idActual = null) {
    const alumnoNormalizado = normalizarTexto(alumnoNombre);

    let sql =
        "SELECT id FROM calificaciones WHERE alumno_normalizado = ? AND materia_id = ?";
    const valores = [alumnoNormalizado, materiaId];

    if (idActual !== null) {
        sql += " AND id <> ?";
        valores.push(idActual);
    }

    const [calificaciones] = await db.execute(sql, valores);

    return calificaciones.length > 0;
}

export const validarId = [
    param("id")
        .isInt({ min: 1 })
        .withMessage("El id debe ser un numero entero mayor a 0")
];

export const validarFiltrosCalificaciones = [
    query("alumno")
        .optional()
        .isString()
        .withMessage("El alumno debe ser un texto")
        .bail()
        .trim()
        .isLength({ min: 2, max: 60 })
        .withMessage("El alumno debe tener entre 2 y 60 caracteres"),

    query("materiaId")
        .optional()
        .isInt({ min: 1 })
        .withMessage("materiaId debe ser un numero entero mayor a 0")
];

export const validarMateria = [
    body("nombre")
        .exists()
        .withMessage("El nombre de la materia es obligatorio")
        .bail()
        .isString()
        .withMessage("El nombre debe ser un texto")
        .bail()
        .trim()
        .isLength({ min: 2, max: 60 })
        .withMessage("El nombre debe tener entre 2 y 60 caracteres")
        .bail()
        .custom(async (nombre) => {
            if (await existeMateriaConNombre(nombre)) {
                throw new Error("Ya existe una materia con ese nombre");
        }

        return true;
    })
];

export const validarCalificacion = [
    body("alumnoNombre")
        .exists()
        .withMessage("El nombre del alumno es obligatorio")
        .bail()
        .isString()
        .withMessage("El nombre del alumno debe ser un texto")
        .bail()
        .trim()
        .isLength({ min: 2, max: 60 })
        .withMessage("El nombre del alumno debe tener entre 2 y 60 caracteres"),

    body("materiaId")
        .exists()
        .withMessage("materiaId es obligatorio")
        .bail()
        .isInt({ min: 1 })
        .withMessage("materiaId debe ser un numero entero mayor a 0")
        .bail()
        .custom(async (materiaId) => {
            if (!(await existeMateria(Number(materiaId)))) {
                throw new Error("La materia indicada no existe");
        }

        return true;
    }),

    body("notas")
        .exists()
        .withMessage("Las notas son obligatorias")
        .bail()
        .isArray({ min: 3, max: 3 })
        .withMessage("Deben enviarse exactamente tres notas"),

    body("notas.*")
        .isFloat({ min: 1, max: 10 })
        .withMessage("Cada nota debe ser numerica y estar entre 1 y 10"),

    body().custom(async (body, { req }) => {
        if (!body.alumnoNombre || !body.materiaId) {
            return true;
    }

    const idActual = req.params.id ? Number(req.params.id) : null;

    if (
        await existeCalificacion(
            body.alumnoNombre,
            Number(body.materiaId),
            idActual
        )
    ) {
        throw new Error("Ya existe una calificacion para ese alumno y materia");
    }

    return true;
    })
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