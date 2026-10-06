import express from "express";
import { body, param, validationResult } from "express-validator";
import conexion from "./db.js";

const app = express();
const PORT = 3000;

app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        mensaje: "API de notas de alumnos funcionando"
    });
});

app.get("/materias", (req, res) => {
    const sql = "SELECT * FROM materias";

    conexion.query(sql, (error, resultados) => {
        if (error) {
            return res.status(500).json({
                error: "Error al consultar las materias"
            });
        }

        res.status(200).json(resultados);
    });
});

app.post(
    "/notas",
    [
        body("alumno")
            .trim()
            .notEmpty()
            .withMessage("El nombre del alumno es obligatorio")
            .isLength({ max: 100 })
            .withMessage("El nombre del alumno no puede superar los 100 caracteres"),

        body("materia_id")
            .isInt({ gt: 0 })
            .withMessage("La materia debe tener un id entero mayor que cero"),

        body("notas")
            .isArray({ min: 3, max: 3 })
            .withMessage("Se deben enviar exactamente tres notas"),

        body("notas.*")
            .isFloat({ min: 0, max: 10 })
            .withMessage("Cada nota debe ser un número entre 0 y 10")
    ],
    (req, res) => {
        const errores = validationResult(req);

        if (!errores.isEmpty()) {
            return res.status(400).json({
                errores: errores.array()
            });
        }

        const alumno = req.body.alumno.trim();
        const materiaId = Number(req.body.materia_id);
        const notas = req.body.notas.map(Number);

        // Comprobar que la materia exista
        const sqlMateria = "SELECT id FROM materias WHERE id = ?";

        conexion.query(sqlMateria, [materiaId], (error, materias) => {
            if (error) {
                return res.status(500).json({
                    error: "Error al comprobar la materia"
                });
            }

            if (materias.length === 0) {
                return res.status(400).json({
                    error: "La materia indicada no existe"
                });
            }

            // Comprobar que el alumno no tenga ya notas para esa materia
            const sqlDuplicado = `
                SELECT id
                FROM notas_alumnos
                WHERE LOWER(alumno) = LOWER(?)
                AND materia_id = ?
            `;

            conexion.query(
                sqlDuplicado,
                [alumno, materiaId],
                (error, resultados) => {
                    if (error) {
                        return res.status(500).json({
                            error: "Error al comprobar el registro"
                        });
                    }

                    if (resultados.length > 0) {
                        return res.status(409).json({
                            error: "El alumno ya tiene notas registradas para esta materia"
                        });
                    }

                    const sqlInsertar = `
                        INSERT INTO notas_alumnos
                        (alumno, materia_id, nota1, nota2, nota3)
                        VALUES (?, ?, ?, ?, ?)
                    `;

                    conexion.query(
                        sqlInsertar,
                        [alumno, materiaId, notas[0], notas[1], notas[2]],
                        (error, resultado) => {
                            if (error) {
                                return res.status(500).json({
                                    error: "Error al registrar las notas"
                                });
                            }

                            res.status(201).json({
                                id: resultado.insertId,
                                alumno,
                                materia_id: materiaId,
                                notas
                            });
                        }
                    );
                }
            );
        });
    }
);

app.get("/notas", (req, res) => {
    const sql = `
        SELECT
            n.id,
            n.alumno,
            n.materia_id,
            m.nombre AS materia,
            n.nota1,
            n.nota2,
            n.nota3
        FROM notas_alumnos n
        INNER JOIN materias m ON n.materia_id = m.id
    `;

    conexion.query(sql, (error, resultados) => {
        if (error) {
            return res.status(500).json({
                error: "Error al consultar las notas"
            });
        }

        res.status(200).json(resultados);
    });
});

app.get(
    "/notas/:id",
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

        const sql = `
            SELECT
                n.id,
                n.alumno,
                n.materia_id,
                m.nombre AS materia,
                n.nota1,
                n.nota2,
                n.nota3
            FROM notas_alumnos n
            INNER JOIN materias m ON n.materia_id = m.id
            WHERE n.id = ?
        `;

        conexion.query(sql, [id], (error, resultados) => {
            if (error) {
                return res.status(500).json({
                    error: "Error al consultar las notas"
                });
            }

            if (resultados.length === 0) {
                return res.status(404).json({
                    error: "Registro de notas no encontrado"
                });
            }

            res.status(200).json(resultados[0]);
        });
    }
);

app.put(
    "/notas/:id",
    [
        param("id")
            .isInt({ gt: 0 })
            .withMessage("El id debe ser un número entero mayor que cero"),

        body("alumno")
            .trim()
            .notEmpty()
            .withMessage("El nombre del alumno es obligatorio")
            .isLength({ max: 100 })
            .withMessage("El nombre del alumno no puede superar los 100 caracteres"),

        body("materia_id")
            .isInt({ gt: 0 })
            .withMessage("La materia debe tener un id entero mayor que cero"),

        body("notas")
            .isArray({ min: 3, max: 3 })
            .withMessage("Se deben enviar exactamente tres notas"),

        body("notas.*")
            .isFloat({ min: 0, max: 10 })
            .withMessage("Cada nota debe ser un número entre 0 y 10")
    ],
    (req, res) => {
        const errores = validationResult(req);

        if (!errores.isEmpty()) {
            return res.status(400).json({
                errores: errores.array()
            });
        }

        const id = req.params.id;
        const alumno = req.body.alumno.trim();
        const materiaId = Number(req.body.materia_id);
        const notas = req.body.notas.map(Number);

        // Comprobar que la materia exista
        const sqlMateria = "SELECT id FROM materias WHERE id = ?";

        conexion.query(sqlMateria, [materiaId], (error, materias) => {
            if (error) {
                return res.status(500).json({
                    error: "Error al comprobar la materia"
                });
            }

            if (materias.length === 0) {
                return res.status(400).json({
                    error: "La materia indicada no existe"
                });
            }

            // Comprobar que otro registro no tenga
            // la misma combinación alumno + materia
            const sqlDuplicado = `
                SELECT id
                FROM notas_alumnos
                WHERE LOWER(alumno) = LOWER(?)
                AND materia_id = ?
                AND id <> ?
            `;

            conexion.query(
                sqlDuplicado,
                [alumno, materiaId, id],
                (error, resultados) => {
                    if (error) {
                        return res.status(500).json({
                            error: "Error al comprobar el registro"
                        });
                    }

                    if (resultados.length > 0) {
                        return res.status(409).json({
                            error: "El alumno ya tiene notas registradas para esta materia"
                        });
                    }

                    const sqlActualizar = `
                        UPDATE notas_alumnos
                        SET alumno = ?,
                            materia_id = ?,
                            nota1 = ?,
                            nota2 = ?,
                            nota3 = ?
                        WHERE id = ?
                    `;

                    conexion.query(
                        sqlActualizar,
                        [
                            alumno,
                            materiaId,
                            notas[0],
                            notas[1],
                            notas[2],
                            id
                        ],
                        (error, resultado) => {
                            if (error) {
                                return res.status(500).json({
                                    error: "Error al modificar las notas"
                                });
                            }

                            if (resultado.affectedRows === 0) {
                                return res.status(404).json({
                                    error: "Registro de notas no encontrado"
                                });
                            }

                            res.status(200).json({
                                id: Number(id),
                                alumno,
                                materia_id: materiaId,
                                notas
                            });
                        }
                    );
                }
            );
        });
    }
);

app.delete(
    "/notas/:id",
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

        const sql = "DELETE FROM notas_alumnos WHERE id = ?";

        conexion.query(sql, [id], (error, resultado) => {
            if (error) {
                return res.status(500).json({
                    error: "Error al eliminar el registro de notas"
                });
            }

            if (resultado.affectedRows === 0) {
                return res.status(404).json({
                    error: "Registro de notas no encontrado"
                });
            }

            res.status(200).json({
                mensaje: "Registro de notas eliminado correctamente"
            });
        });
    }
);

app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});