import express from "express";
import { body, param, query, validationResult } from "express-validator";
import conexion from "./db.js";

const app = express();
const PORT = 3000;

app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        mensaje: "API de tareas funcionando"
    });
});

app.get(
    "/tareas",
    [
        query("estado")
            .optional()
            .isIn(["completadas", "pendientes"])
            .withMessage("El estado debe ser 'completadas' o 'pendientes'")
    ],
    (req, res) => {
        const errores = validationResult(req);

        if (!errores.isEmpty()) {
            return res.status(400).json({
                errores: errores.array()
            });
        }

        const estado = req.query.estado;

        let sql = "SELECT * FROM tareas";
        let parametros = [];

        if (estado === "completadas") {
            sql += " WHERE completada = ?";
            parametros.push(true);
        }

        if (estado === "pendientes") {
            sql += " WHERE completada = ?";
            parametros.push(false);
        }

        conexion.query(sql, parametros, (error, resultados) => {
            if (error) {
                return res.status(500).json({
                    error: "Error al consultar las tareas"
                });
            }

            res.status(200).json(resultados);
        });
    }
);

app.post(
    "/tareas",
    [
        body("nombre")
            .trim()
            .notEmpty()
            .withMessage("El nombre de la tarea es obligatorio")
            .isLength({ max: 100 })
            .withMessage("El nombre no puede superar los 100 caracteres"),

        body("completada")
            .isBoolean()
            .withMessage("El estado completada debe ser un valor booleano")
    ],
    (req, res) => {
        const errores = validationResult(req);

        if (!errores.isEmpty()) {
            return res.status(400).json({
                errores: errores.array()
            });
        }

        const nombre = req.body.nombre.trim();
        const completada = req.body.completada;

        // Comprobar si ya existe una tarea con el mismo nombre
        const sqlBuscar = `
            SELECT id
            FROM tareas
            WHERE LOWER(nombre) = LOWER(?)
        `;

        conexion.query(sqlBuscar, [nombre], (error, resultados) => {
            if (error) {
                return res.status(500).json({
                    error: "Error al comprobar la tarea"
                });
            }

            if (resultados.length > 0) {
                return res.status(409).json({
                    error: "Ya existe una tarea con ese nombre"
                });
            }

            const sqlInsertar = `
                INSERT INTO tareas (nombre, completada)
                VALUES (?, ?)
            `;

            conexion.query(
                sqlInsertar,
                [nombre, completada],
                (error, resultado) => {
                    if (error) {
                        return res.status(500).json({
                            error: "Error al crear la tarea"
                        });
                    }

                    res.status(201).json({
                        id: resultado.insertId,
                        nombre,
                        completada
                    });
                }
            );
        });
    }
);

app.get(
    "/tareas/:id",
    [
        param("id")
            .isInt({ gt: 0 })
            .withMessage("El id debe ser un número entero mayor que cero")
    ],
    (req, res) => {
        const errores = validationResult(req);

        if (!errores.isEmpty()) {
            return res.status(400).json({
                errores: errores.array()
            });
        }

        const id = req.params.id;

        const sql = "SELECT * FROM tareas WHERE id = ?";

        conexion.query(sql, [id], (error, resultados) => {
            if (error) {
                return res.status(500).json({
                    error: "Error al consultar la tarea"
                });
            }

            if (resultados.length === 0) {
                return res.status(404).json({
                    error: "Tarea no encontrada"
                });
            }

            res.status(200).json(resultados[0]);
        });
    }
);

app.put(
    "/tareas/:id",
    [
        param("id")
            .isInt({ gt: 0 })
            .withMessage("El id debe ser un número entero mayor que cero"),

        body("nombre")
            .trim()
            .notEmpty()
            .withMessage("El nombre de la tarea es obligatorio")
            .isLength({ max: 100 })
            .withMessage("El nombre no puede superar los 100 caracteres"),

        body("completada")
            .isBoolean()
            .withMessage("El estado completada debe ser un valor booleano")
    ],
    (req, res) => {
        const errores = validationResult(req);

        if (!errores.isEmpty()) {
            return res.status(400).json({
                errores: errores.array()
            });
        }

        const id = req.params.id;
        const nombre = req.body.nombre.trim();
        const completada = req.body.completada;

        // Buscar otra tarea que ya tenga ese nombre
        const sqlBuscar = `
            SELECT id
            FROM tareas
            WHERE LOWER(nombre) = LOWER(?)
            AND id <> ?
        `;

        conexion.query(sqlBuscar, [nombre, id], (error, resultados) => {
            if (error) {
                return res.status(500).json({
                    error: "Error al comprobar la tarea"
                });
            }

            if (resultados.length > 0) {
                return res.status(409).json({
                    error: "Ya existe otra tarea con ese nombre"
                });
            }

            const sqlActualizar = `
                UPDATE tareas
                SET nombre = ?, completada = ?
                WHERE id = ?
            `;

            conexion.query(
                sqlActualizar,
                [nombre, completada, id],
                (error, resultado) => {
                    if (error) {
                        return res.status(500).json({
                            error: "Error al modificar la tarea"
                        });
                    }

                    if (resultado.affectedRows === 0) {
                        return res.status(404).json({
                            error: "Tarea no encontrada"
                        });
                    }

                    res.status(200).json({
                        id: Number(id),
                        nombre,
                        completada
                    });
                }
            );
        });
    }
);

app.delete(
    "/tareas/:id",
    [
        param("id")
            .isInt({ gt: 0 })
            .withMessage("El id debe ser un número entero mayor que cero")
    ],
    (req, res) => {
        const errores = validationResult(req);

        if (!errores.isEmpty()) {
            return res.status(400).json({
                errores: errores.array()
            });
        }

        const id = req.params.id;

        const sql = "DELETE FROM tareas WHERE id = ?";

        conexion.query(sql, [id], (error, resultado) => {
            if (error) {
                return res.status(500).json({
                    error: "Error al eliminar la tarea"
                });
            }

            if (resultado.affectedRows === 0) {
                return res.status(404).json({
                    error: "Tarea no encontrada"
                });
            }

            res.status(200).json({
                mensaje: "Tarea eliminada correctamente"
            });
        });
    }
);

app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});