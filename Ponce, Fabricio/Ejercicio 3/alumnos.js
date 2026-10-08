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

const validacionesAlumno = [
    body("nombre")
        .isString()
        .withMessage("El nombre debe ser un texto")
        .trim()
        .notEmpty()
        .withMessage("El nombre es obligatorio"),

    body("materia_id")
        .isInt({ gt: 0 })
        .withMessage("La materia debe tener un id válido"),

    body("notas")
        .custom(notas =>
            Array.isArray(notas) &&
            notas.length === 3 &&
            notas.every(
                nota =>
                    typeof nota === "number" &&
                    Number.isFinite(nota) &&
                    nota >= 0 &&
                    nota <= 10
            )
        )
        .withMessage("Se deben indicar exactamente tres notas entre 0 y 10")
];


// Crear alumno
router.post(
    "/",
    validacionesAlumno,
    validarErrores,
    async (req, res) => {
        try {
            const nombre = req.body.nombre.trim();
            const materiaId = Number(req.body.materia_id);
            const { notas } = req.body;

            const [materias] = await db.execute(
                "SELECT id FROM materias WHERE id = ?",
                [materiaId]
            );

            if (materias.length === 0) {
                return res.status(400).json({
                    error: "La materia no existe"
                });
            }

            const [existentes] = await db.execute(
                `SELECT id FROM alumnos
                WHERE LOWER(TRIM(nombre)) = LOWER(?)
                AND materia_id = ?`,
                [nombre, materiaId]
            );

            if (existentes.length > 0) {
                return res.status(400).json({
                    error: "Ya existe un registro para ese alumno y materia"
                });
            }

            const [resultado] = await db.execute(
                `INSERT INTO alumnos
                (nombre, materia_id, nota1, nota2, nota3)
                VALUES (?, ?, ?, ?, ?)`,
                [
                    nombre,
                    materiaId,
                    notas[0],
                    notas[1],
                    notas[2]
                ]
            );

            return res.status(201).json({
                id: resultado.insertId,
                nombre,
                materia_id: materiaId,
                notas
            });

        } catch (error) {
            return res.status(500).json({
                error: "Error al crear el alumno"
            });
        }
    }
);


// Listar alumnos
router.get("/", async (req, res) => {
    try {
        const [alumnos] = await db.execute(
            `SELECT
                alumnos.id,
                alumnos.nombre,
                alumnos.materia_id,
                materias.nombre AS materia,
                alumnos.nota1,
                alumnos.nota2,
                alumnos.nota3
            FROM alumnos
            INNER JOIN materias
            ON alumnos.materia_id = materias.id`
        );

        return res.status(200).json(alumnos);

    } catch (error) {
        return res.status(500).json({
            error: "Error al consultar los alumnos"
        });
    }
});


// Consultar alumno por ID
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

            const [alumnos] = await db.execute(
                `SELECT
                    alumnos.id,
                    alumnos.nombre,
                    alumnos.materia_id,
                    materias.nombre AS materia,
                    alumnos.nota1,
                    alumnos.nota2,
                    alumnos.nota3
                FROM alumnos
                INNER JOIN materias
                ON alumnos.materia_id = materias.id
                WHERE alumnos.id = ?`,
                [id]
            );

            if (alumnos.length === 0) {
                return res.status(404).json({
                    error: "Alumno no encontrado"
                });
            }

            return res.status(200).json(alumnos[0]);

        } catch (error) {
            return res.status(500).json({
                error: "Error al consultar el alumno"
            });
        }
    }
);


// Modificar alumno
router.put(
    "/:id",
    [
        param("id")
            .isInt({ gt: 0 })
            .withMessage("El id debe ser un número entero mayor que cero"),

        ...validacionesAlumno
    ],
    validarErrores,
    async (req, res) => {
        try {
            const id = Number(req.params.id);
            const nombre = req.body.nombre.trim();
            const materiaId = Number(req.body.materia_id);
            const { notas } = req.body;

            const [alumnos] = await db.execute(
                "SELECT id FROM alumnos WHERE id = ?",
                [id]
            );

            if (alumnos.length === 0) {
                return res.status(404).json({
                    error: "Alumno no encontrado"
                });
            }

            const [materias] = await db.execute(
                "SELECT id FROM materias WHERE id = ?",
                [materiaId]
            );

            if (materias.length === 0) {
                return res.status(400).json({
                    error: "La materia no existe"
                });
            }

            const [existentes] = await db.execute(
                `SELECT id FROM alumnos
                WHERE LOWER(TRIM(nombre)) = LOWER(?)
                AND materia_id = ?
                AND id <> ?`,
                [nombre, materiaId, id]
            );

            if (existentes.length > 0) {
                return res.status(400).json({
                    error: "Ya existe un registro para ese alumno y materia"
                });
            }

            await db.execute(
                `UPDATE alumnos
                SET nombre = ?,
                    materia_id = ?,
                    nota1 = ?,
                    nota2 = ?,
                    nota3 = ?
                WHERE id = ?`,
                [
                    nombre,
                    materiaId,
                    notas[0],
                    notas[1],
                    notas[2],
                    id
                ]
            );

            return res.status(200).json({
                id,
                nombre,
                materia_id: materiaId,
                notas
            });

        } catch (error) {
            return res.status(500).json({
                error: "Error al modificar el alumno"
            });
        }
    }
);


// Eliminar alumno
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
                "DELETE FROM alumnos WHERE id = ?",
                [id]
            );

            if (resultado.affectedRows === 0) {
                return res.status(404).json({
                    error: "Alumno no encontrado"
                });
            }

            return res.status(200).json({
                mensaje: "Alumno eliminado"
            });

        } catch (error) {
            return res.status(500).json({
                error: "Error al eliminar el alumno"
            });
        }
    }
);

export default router;