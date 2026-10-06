import express from "express";
import mysql from "mysql2/promise";
import { body, param, query, validationResult } from "express-validator";

const app = express();

app.use(express.json());

const conexion = await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "fefe",
    database: "tp2_programacion_iv"
});

console.log("Conectado a MySQL");

// =========================
// VALIDACIONES
// =========================

const validarId = [
    param("id")
        .isInt({ min: 1 })
        .withMessage("El ID debe ser un número entero mayor que 0")
];

const validarMateria = [
    body("nombre")
        .trim()
        .notEmpty()
        .withMessage("El nombre de la materia es obligatorio")
        .bail()
        .isLength({ max: 255 })
        .withMessage("El nombre de la materia no puede superar los 255 caracteres")
];

const validarCalificacion = [
    body("alumno")
        .trim()
        .notEmpty()
        .withMessage("El nombre del alumno es obligatorio")
        .bail()
        .isLength({ max: 255 })
        .withMessage("El nombre del alumno no puede superar los 255 caracteres"),

    body("materia_id")
        .isInt({ min: 1 })
        .withMessage("El materia_id debe ser un número entero mayor que 0"),

    body("nota1")
        .isFloat({ min: 0, max: 10 })
        .withMessage("La nota1 debe ser un número entre 0 y 10"),

    body("nota2")
        .isFloat({ min: 0, max: 10 })
        .withMessage("La nota2 debe ser un número entre 0 y 10"),

    body("nota3")
        .isFloat({ min: 0, max: 10 })
        .withMessage("La nota3 debe ser un número entre 0 y 10")
];

const validarFiltroAlumno = [
    query("alumno")
        .optional()
        .trim()
        .isLength({ min: 1, max: 255 })
        .withMessage("El alumno debe ser válido")
];

// =========================
// RUTA PRINCIPAL
// =========================

app.get("/", (req, res) => {
    res.json({
        mensaje: "API de Calificaciones funcionando"
    });
});

// =========================
// MATERIAS
// =========================

// GET todas las materias
app.get("/materias", async (req, res) => {
    const [materias] = await conexion.query(
        "SELECT * FROM materias ORDER BY id"
    );

    res.json(materias);
});

// POST crear materia
app.post("/materias", validarMateria, async (req, res) => {
    const errores = validationResult(req);

    if (!errores.isEmpty()) {
        return res.status(400).json({
            errores: errores.array()
        });
    }

    const { nombre } = req.body;

    const [existentes] = await conexion.query(
        "SELECT id FROM materias WHERE LOWER(TRIM(nombre)) = LOWER(TRIM(?))",
        [nombre]
    );

    if (existentes.length > 0) {
        return res.status(409).json({
            error: "Ya existe una materia con ese nombre"
        });
    }

    const [resultado] = await conexion.query(
        "INSERT INTO materias (nombre) VALUES (?)",
        [nombre.trim()]
    );

    res.status(201).json({
        id: resultado.insertId,
        nombre: nombre.trim()
    });
});

// GET materia por ID
app.get("/materias/:id", validarId, async (req, res) => {
    const errores = validationResult(req);

    if (!errores.isEmpty()) {
        return res.status(400).json({
            errores: errores.array()
        });
    }

    const { id } = req.params;

    const [materias] = await conexion.query(
        "SELECT * FROM materias WHERE id = ?",
        [id]
    );

    if (materias.length === 0) {
        return res.status(404).json({
            error: "Materia no encontrada"
        });
    }

    res.json(materias[0]);
});

// =========================
// CALIFICACIONES
// =========================

// GET todas las calificaciones
app.get("/calificaciones", validarFiltroAlumno, async (req, res) => {
    const errores = validationResult(req);

    if (!errores.isEmpty()) {
        return res.status(400).json({
            errores: errores.array()
        });
    }

    const { alumno } = req.query;

    let sql = `
        SELECT
            c.id,
            c.alumno,
            m.nombre AS materia,
            c.nota1,
            c.nota2,
            c.nota3
        FROM calificaciones c
        INNER JOIN materias m ON c.materia_id = m.id
    `;

    const valores = [];

    if (alumno !== undefined) {
        sql += " WHERE LOWER(TRIM(c.alumno)) = LOWER(TRIM(?))";
        valores.push(alumno);
    }

    sql += " ORDER BY c.id";

    const [calificaciones] = await conexion.query(sql, valores);

    res.json(calificaciones);
});

// POST crear calificación
app.post("/calificaciones", validarCalificacion, async (req, res) => {
    const errores = validationResult(req);

    if (!errores.isEmpty()) {
        return res.status(400).json({
            errores: errores.array()
        });
    }

    const {
        alumno,
        materia_id,
        nota1,
        nota2,
        nota3
    } = req.body;

    // Verificar que exista la materia
    const [materias] = await conexion.query(
        "SELECT id, nombre FROM materias WHERE id = ?",
        [materia_id]
    );

    if (materias.length === 0) {
        return res.status(404).json({
            error: "La materia no existe"
        });
    }

    // Verificar que no exista alumno + materia
    const [existentes] = await conexion.query(
        `SELECT id
         FROM calificaciones
         WHERE LOWER(TRIM(alumno)) = LOWER(TRIM(?))
         AND materia_id = ?`,
        [alumno, materia_id]
    );

    if (existentes.length > 0) {
        return res.status(409).json({
            error: "Ya existe una calificación para ese alumno y esa materia"
        });
    }

    const [resultado] = await conexion.query(
        `INSERT INTO calificaciones
        (alumno, materia_id, nota1, nota2, nota3)
        VALUES (?, ?, ?, ?, ?)`,
        [
            alumno.trim(),
            materia_id,
            nota1,
            nota2,
            nota3
        ]
    );

    res.status(201).json({
        id: resultado.insertId,
        alumno: alumno.trim(),
        materia: materias[0].nombre,
        nota1,
        nota2,
        nota3
    });
});

// GET calificación por ID
app.get("/calificaciones/:id", validarId, async (req, res) => {
    const errores = validationResult(req);

    if (!errores.isEmpty()) {
        return res.status(400).json({
            errores: errores.array()
        });
    }

    const { id } = req.params;

    const [calificaciones] = await conexion.query(
        `SELECT
            c.id,
            c.alumno,
            m.nombre AS materia,
            c.nota1,
            c.nota2,
            c.nota3
         FROM calificaciones c
         INNER JOIN materias m ON c.materia_id = m.id
         WHERE c.id = ?`,
        [id]
    );

    if (calificaciones.length === 0) {
        return res.status(404).json({
            error: "Calificación no encontrada"
        });
    }

    res.json(calificaciones[0]);
});

// PUT modificar calificación
app.put(
    "/calificaciones/:id",
    validarId,
    validarCalificacion,
    async (req, res) => {

        const errores = validationResult(req);

        if (!errores.isEmpty()) {
            return res.status(400).json({
                errores: errores.array()
            });
        }

        const { id } = req.params;

        const {
            alumno,
            materia_id,
            nota1,
            nota2,
            nota3
        } = req.body;

        // Verificar que exista la materia
        const [materias] = await conexion.query(
            "SELECT id, nombre FROM materias WHERE id = ?",
            [materia_id]
        );

        if (materias.length === 0) {
            return res.status(404).json({
                error: "La materia no existe"
            });
        }

        // Verificar duplicado excluyendo el registro actual
        const [existentes] = await conexion.query(
            `SELECT id
             FROM calificaciones
             WHERE LOWER(TRIM(alumno)) = LOWER(TRIM(?))
             AND materia_id = ?
             AND id <> ?`,
            [alumno, materia_id, id]
        );

        if (existentes.length > 0) {
            return res.status(409).json({
                error: "Ya existe una calificación para ese alumno y esa materia"
            });
        }

        const [resultado] = await conexion.query(
            `UPDATE calificaciones
             SET alumno = ?,
                 materia_id = ?,
                 nota1 = ?,
                 nota2 = ?,
                 nota3 = ?
             WHERE id = ?`,
            [
                alumno.trim(),
                materia_id,
                nota1,
                nota2,
                nota3,
                id
            ]
        );

        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                error: "Calificación no encontrada"
            });
        }

        res.json({
            id,
            alumno: alumno.trim(),
            materia: materias[0].nombre,
            nota1,
            nota2,
            nota3
        });
    }
);

// DELETE calificación
app.delete("/calificaciones/:id", validarId, async (req, res) => {
    const errores = validationResult(req);

    if (!errores.isEmpty()) {
        return res.status(400).json({
            errores: errores.array()
        });
    }

    const { id } = req.params;

    const [resultado] = await conexion.query(
        "DELETE FROM calificaciones WHERE id = ?",
        [id]
    );

    if (resultado.affectedRows === 0) {
        return res.status(404).json({
            error: "Calificación no encontrada"
        });
    }

    res.json({
        mensaje: "Calificación eliminada correctamente"
    });
});

// =========================
// SERVIDOR
// =========================

app.listen(3000, () => {
    console.log("Servidor ejecutándose en http://localhost:3000");
});