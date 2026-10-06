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

app.get("/", (req, res) => {
    res.json({
        mensaje: "API de Tareas funcionando"
    });
});

const validarTarea = [
    body("nombre")
        .trim()
        .notEmpty()
        .withMessage("El nombre es obligatorio")
        .bail()
        .isLength({ max: 255 })
        .withMessage("El nombre no puede superar los 255 caracteres"),

    body("completada")
        .isBoolean()
        .withMessage("El estado completada debe ser booleano")
];

const validarId = [
    param("id")
        .isInt({ min: 1 })
        .withMessage("El ID debe ser un número entero mayor que 0")
];

const validarFiltro = [
    query("completada")
        .optional()
        .isBoolean()
        .withMessage("El filtro completada debe ser booleano")
];

app.get("/tareas", validarFiltro, async (req, res) => {
    const errores = validationResult(req);

    if (!errores.isEmpty()) {
        return res.status(400).json({
            errores: errores.array()
        });
    }

    const { completada } = req.query;

    if (completada === undefined) {
        const [tareas] = await conexion.query(
            "SELECT * FROM tareas"
        );

        return res.json(tareas);
    }

    const [tareas] = await conexion.query(
        "SELECT * FROM tareas WHERE completada = ?",
        [completada === "true" ? 1 : 0]
    );

    res.json(tareas);
});

app.post("/tareas", validarTarea, async (req, res) => {
    const errores = validationResult(req);

    if (!errores.isEmpty()) {
        return res.status(400).json({
            errores: errores.array()
        });
    }

    const { nombre, completada } = req.body;

    const [tareas] = await conexion.query(
        "SELECT id FROM tareas WHERE LOWER(TRIM(nombre)) = LOWER(TRIM(?))",
        [nombre]
    );

    if (tareas.length > 0) {
        return res.status(409).json({
            error: "Ya existe una tarea con ese nombre"
        });
    }

    const [resultado] = await conexion.query(
        "INSERT INTO tareas (nombre, completada) VALUES (?, ?)",
        [nombre.trim(), completada]
    );

    res.status(201).json({
        id: resultado.insertId,
        nombre: nombre.trim(),
        completada
    });
});

app.get("/tareas/:id", validarId, async (req, res) => {
    const errores = validationResult(req);

    if (!errores.isEmpty()) {
        return res.status(400).json({
            errores: errores.array()
        });
    }

    const { id } = req.params;

    const [tareas] = await conexion.query(
        "SELECT * FROM tareas WHERE id = ?",
        [id]
    );

    if (tareas.length === 0) {
        return res.status(404).json({
            error: "Tarea no encontrada"
        });
    }

    res.json(tareas[0]);
});

app.put("/tareas/:id", validarId, validarTarea, async (req, res) => {
    const errores = validationResult(req);

    if (!errores.isEmpty()) {
        return res.status(400).json({
            errores: errores.array()
        });
    }

    const { id } = req.params;
    const { nombre, completada } = req.body;

    const [duplicadas] = await conexion.query(
        "SELECT id FROM tareas WHERE LOWER(TRIM(nombre)) = LOWER(TRIM(?)) AND id <> ?",
        [nombre, id]
    );

    if (duplicadas.length > 0) {
        return res.status(409).json({
            error: "Ya existe otra tarea con ese nombre"
        });
    }

    const [resultado] = await conexion.query(
        "UPDATE tareas SET nombre = ?, completada = ? WHERE id = ?",
        [nombre.trim(), completada, id]
    );

    if (resultado.affectedRows === 0) {
        return res.status(404).json({
            error: "Tarea no encontrada"
        });
    }

    res.json({
        id,
        nombre: nombre.trim(),
        completada
    });
});

app.delete("/tareas/:id", validarId, async (req, res) => {
    const errores = validationResult(req);

    if (!errores.isEmpty()) {
        return res.status(400).json({
            errores: errores.array()
        });
    }

    const { id } = req.params;

    const [resultado] = await conexion.query(
        "DELETE FROM tareas WHERE id = ?",
        [id]
    );

    if (resultado.affectedRows === 0) {
        return res.status(404).json({
            error: "Tarea no encontrada"
        });
    }

    res.json({
        mensaje: "Tarea eliminada correctamente"
    });
});

app.listen(3000, () => {
    console.log("Servidor ejecutándose en http://localhost:3000");
});