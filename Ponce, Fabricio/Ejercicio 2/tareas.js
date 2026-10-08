import { Router } from "express";
import { body, param, query, validationResult } from "express-validator";
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


// Crear tarea
router.post(
    "/",
    [
        body("nombre")
            .isString()
            .withMessage("El nombre debe ser un texto")
            .trim()
            .notEmpty()
            .withMessage("El nombre es obligatorio"),

        body("completada")
            .custom(valor => typeof valor === "boolean")
            .withMessage("Completada debe ser true o false")
    ],
    validarErrores,
    async (req, res) => {
        try {
            const nombre = req.body.nombre.trim();
            const { completada } = req.body;

            const [existentes] = await db.execute(
                `SELECT id FROM tareas
                WHERE LOWER(TRIM(nombre)) = LOWER(?)`,
                [nombre]
            );

            if (existentes.length > 0) {
                return res.status(400).json({
                    error: "Ya existe una tarea con ese nombre"
                });
            }

            const [resultado] = await db.execute(
                `INSERT INTO tareas (nombre, completada)
                VALUES (?, ?)`,
                [nombre, completada]
            );

            return res.status(201).json({
                id: resultado.insertId,
                nombre,
                completada
            });

        } catch (error) {
            return res.status(500).json({
                error: "Error al crear la tarea"
            });
        }
    }
);


// Listar y filtrar tareas
router.get(
    "/",
    [
        query("estado")
            .optional()
            .isIn(["completadas", "pendientes"])
            .withMessage("El estado debe ser completadas o pendientes")
    ],
    validarErrores,
    async (req, res) => {
        try {
            const { estado } = req.query;

            let consulta = "SELECT * FROM tareas";
            let valores = [];

            if (estado === "completadas") {
                consulta += " WHERE completada = ?";
                valores.push(true);
            }

            if (estado === "pendientes") {
                consulta += " WHERE completada = ?";
                valores.push(false);
            }

            const [tareas] = await db.execute(
                consulta,
                valores
            );

            return res.status(200).json(tareas);

        } catch (error) {
            return res.status(500).json({
                error: "Error al consultar las tareas"
            });
        }
    }
);


// Consultar tarea por ID
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

            const [tareas] = await db.execute(
                "SELECT * FROM tareas WHERE id = ?",
                [id]
            );

            if (tareas.length === 0) {
                return res.status(404).json({
                    error: "Tarea no encontrada"
                });
            }

            return res.status(200).json(tareas[0]);

        } catch (error) {
            return res.status(500).json({
                error: "Error al consultar la tarea"
            });
        }
    }
);


// Modificar tarea
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
            .withMessage("El nombre es obligatorio"),

        body("completada")
            .custom(valor => typeof valor === "boolean")
            .withMessage("Completada debe ser true o false")
    ],
    validarErrores,
    async (req, res) => {
        try {
            const id = Number(req.params.id);
            const nombre = req.body.nombre.trim();
            const { completada } = req.body;

            const [tareas] = await db.execute(
                "SELECT * FROM tareas WHERE id = ?",
                [id]
            );

            if (tareas.length === 0) {
                return res.status(404).json({
                    error: "Tarea no encontrada"
                });
            }

            const [existentes] = await db.execute(
                `SELECT id FROM tareas
                WHERE LOWER(TRIM(nombre)) = LOWER(?)
                AND id <> ?`,
                [nombre, id]
            );

            if (existentes.length > 0) {
                return res.status(400).json({
                    error: "Ya existe una tarea con ese nombre"
                });
            }

            await db.execute(
                `UPDATE tareas
                SET nombre = ?, completada = ?
                WHERE id = ?`,
                [nombre, completada, id]
            );

            return res.status(200).json({
                id,
                nombre,
                completada
            });

        } catch (error) {
            return res.status(500).json({
                error: "Error al modificar la tarea"
            });
        }
    }
);


// Eliminar tarea
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

            const [resultado] = await db.execute(
                "DELETE FROM tareas WHERE id = ?",
                [id]
            );

            if (resultado.affectedRows === 0) {
                return res.status(404).json({
                    error: "Tarea no encontrada"
                });
            }

            return res.status(200).json({
                mensaje: "Tarea eliminada"
            });

        } catch (error) {
            return res.status(500).json({
                error: "Error al eliminar la tarea"
            });
        }
    }
);

export default router;