import { Router } from "express";
import { body, param, validationResult } from "express-validator";
import db from "./db.js";

const router = Router();

function validarErrores(req, res, next) {
    const errores = validationResult(req);

    if (!errores.isEmpty()) {
        return res.status(400).json({
            errores: errores.array()
        });
    }

    next();
}


// Listar materias
router.get("/", async (req, res) => {
    try {
        const [materias] = await db.execute(
            "SELECT * FROM materias"
        );

        return res.status(200).json(materias);

    } catch (error) {
        return res.status(500).json({
            error: "Error al consultar las materias"
        });
    }
});


// Consultar materia por ID
router.get(
    "/:id",
    [
        param("id")
            .isInt({ gt: 0 })
            .withMessage("El id debe ser un número entero mayor que cero")
    ],
    validarErrores,
    async (req, res) => {
        try {
            const id = Number(req.params.id);

            const [materias] = await db.execute(
                "SELECT * FROM materias WHERE id = ?",
                [id]
            );

            if (materias.length === 0) {
                return res.status(404).json({
                    error: "Materia no encontrada"
                });
            }

            return res.status(200).json(materias[0]);

        } catch (error) {
            return res.status(500).json({
                error: "Error al consultar la materia"
            });
        }
    }
);


// Crear materia
router.post(
    "/",
    [
        body("nombre")
            .isString()
            .withMessage("El nombre debe ser un texto")
            .trim()
            .notEmpty()
            .withMessage("El nombre es obligatorio")
    ],
    validarErrores,
    async (req, res) => {
        try {
            const nombre = req.body.nombre.trim();

            const [existentes] = await db.execute(
                `SELECT id FROM materias
                WHERE LOWER(TRIM(nombre)) = LOWER(?)`,
                [nombre]
            );

            if (existentes.length > 0) {
                return res.status(400).json({
                    error: "Ya existe una materia con ese nombre"
                });
            }

            const [resultado] = await db.execute(
                "INSERT INTO materias (nombre) VALUES (?)",
                [nombre]
            );

            return res.status(201).json({
                id: resultado.insertId,
                nombre
            });

        } catch (error) {
            return res.status(500).json({
                error: "Error al crear la materia"
            });
        }
    }
);


// Modificar materia
router.put(
    "/:id",
    [
        param("id")
            .isInt({ gt: 0 })
            .withMessage("El id debe ser un número entero mayor que cero"),

        body("nombre")
            .isString()
            .withMessage("El nombre debe ser un texto")
            .trim()
            .notEmpty()
            .withMessage("El nombre es obligatorio")
    ],
    validarErrores,
    async (req, res) => {
        try {
            const id = Number(req.params.id);
            const nombre = req.body.nombre.trim();

            const [materias] = await db.execute(
                "SELECT id FROM materias WHERE id = ?",
                [id]
            );

            if (materias.length === 0) {
                return res.status(404).json({
                    error: "Materia no encontrada"
                });
            }

            const [existentes] = await db.execute(
                `SELECT id FROM materias
                WHERE LOWER(TRIM(nombre)) = LOWER(?)
                AND id <> ?`,
                [nombre, id]
            );

            if (existentes.length > 0) {
                return res.status(400).json({
                    error: "Ya existe una materia con ese nombre"
                });
            }

            await db.execute(
                "UPDATE materias SET nombre = ? WHERE id = ?",
                [nombre, id]
            );

            return res.status(200).json({
                id,
                nombre
            });

        } catch (error) {
            return res.status(500).json({
                error: "Error al modificar la materia"
            });
        }
    }
);


// Eliminar materia
router.delete(
    "/:id",
    [
        param("id")
            .isInt({ gt: 0 })
            .withMessage("El id debe ser un número entero mayor que cero")
    ],
    validarErrores,
    async (req, res) => {
        try {
            const id = Number(req.params.id);

            const [alumnos] = await db.execute(
                "SELECT id FROM alumnos WHERE materia_id = ?",
                [id]
            );

            if (alumnos.length > 0) {
                return res.status(400).json({
                    error: "No se puede eliminar una materia con alumnos asociados"
                });
            }

            const [resultado] = await db.execute(
                "DELETE FROM materias WHERE id = ?",
                [id]
            );

            if (resultado.affectedRows === 0) {
                return res.status(404).json({
                    error: "Materia no encontrada"
                });
            }

            return res.status(200).json({
                mensaje: "Materia eliminada"
            });

        } catch (error) {
            return res.status(500).json({
                error: "Error al eliminar la materia"
            });
        }
    }
);

export default router;