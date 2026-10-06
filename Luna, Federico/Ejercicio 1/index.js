import express from "express";
import mysql from "mysql2/promise";
import { body, param, validationResult } from "express-validator";

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
        mensaje: "API de Rectángulos funcionando"
    });
});

app.get("/rectangulos", async (req, res) => {

    const [rectangulos] = await conexion.query(
        "SELECT * FROM rectangulos"
    );

    res.json(rectangulos);
});

const validarId = [
    param("id")
        .isInt({ min: 1 })
        .withMessage("El ID debe ser un número entero mayor que 0")
];

app.get("/rectangulos/:id", validarId, async (req, res) => {

    const errores = validationResult(req);

    if (!errores.isEmpty()) {
        return res.status(400).json({
            errores: errores.array()
        });
    }

    const { id } = req.params;

    const [rectangulos] = await conexion.query(
        "SELECT * FROM rectangulos WHERE id = ?",
        [id]
    );

    if (rectangulos.length === 0) {
        return res.status(404).json({
            error: "Rectángulo no encontrado"
        });
    }

    res.json(rectangulos[0]);
});

const validarRectangulo = [
    body("base")
        .exists()
        .withMessage("La base es obligatoria")
        .bail()
        .isNumeric()
        .withMessage("La base debe ser un número")
        .custom((valor) => valor > 0)
        .withMessage("La base debe ser mayor que 0"),

    body("altura")
        .exists()
        .withMessage("La altura es obligatoria")
        .bail()
        .isNumeric()
        .withMessage("La altura debe ser un número")
        .custom((valor) => valor > 0)
        .withMessage("La altura debe ser mayor que 0")
];

app.post("/rectangulos", validarRectangulo, async (req, res) => {

    const errores = validationResult(req);

    if (!errores.isEmpty()) {
        return res.status(400).json({
            errores: errores.array()
        });
    }

    const { base, altura } = req.body;

    const perimetro = 2 * (base + altura);
    const superficie = base * altura;

    const [resultado] = await conexion.query(
        "INSERT INTO rectangulos (base, altura, perimetro, superficie) VALUES (?, ?, ?, ?)",
        [base, altura, perimetro, superficie]
    );

    res.status(201).json({
        id: resultado.insertId,
        base,
        altura,
        perimetro,
        superficie
    });
});

app.put("/rectangulos/:id", validarId, validarRectangulo, async (req, res) => {

    const errores = validationResult(req);

    if (!errores.isEmpty()) {
        return res.status(400).json({
            errores: errores.array()
        });
    }

    const { id } = req.params;
    const { base, altura } = req.body;

    const perimetro = 2 * (base + altura);
    const superficie = base * altura;

    const [resultado] = await conexion.query(
        "UPDATE rectangulos SET base = ?, altura = ?, perimetro = ?, superficie = ? WHERE id = ?",
        [base, altura, perimetro, superficie, id]
    );

    if (resultado.affectedRows === 0) {
        return res.status(404).json({
            error: "Rectángulo no encontrado"
        });
    }

    res.json({
        id,
        base,
        altura,
        perimetro,
        superficie
    });
});

app.delete("/rectangulos/:id", validarId, async (req, res) => {

    const errores = validationResult(req);

    if (!errores.isEmpty()) {
        return res.status(400).json({
            errores: errores.array()
        });
    }

    const { id } = req.params;

    const [resultado] = await conexion.query(
        "DELETE FROM rectangulos WHERE id = ?",
        [id]
    );

    if (resultado.affectedRows === 0) {
        return res.status(404).json({
            error: "Rectángulo no encontrado"
        });
    }

    res.json({
        mensaje: "Rectángulo eliminado correctamente"
    });
});

app.listen(3000, () => {
    console.log("Servidor ejecutándose en http://localhost:3000");
});