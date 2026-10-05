import express from "express";
import { db } from "./db.js";
import {
    validarId,
    validarMateria,
    verificarValidaciones
} from "./validaciones.js";

const router = express.Router();

function normalizarTexto(texto) {
    return texto.trim().toLowerCase();
}

router.get("/", async (req, res) => {
    const [materias] = await db.execute(
        "SELECT id, nombre FROM materias ORDER BY nombre"
    );

    res.status(200).json({
        cantidad: materias.length,
        materias
    });
});

router.get("/:id", validarId, verificarValidaciones, async (req, res) => {
    const id = Number(req.params.id);

    const [materias] = await db.execute(
        "SELECT id, nombre FROM materias WHERE id = ?",
        [id]
    );

    if (materias.length === 0) {
        return res.status(404).json({
            mensaje: "Materia no encontrada"
        });
    }

    res.status(200).json(materias[0]);
});

router.post("/", validarMateria, verificarValidaciones, async (req, res) => {
    const nombre = req.body.nombre.trim();
    const nombreNormalizado = normalizarTexto(nombre);

    const [resultado] = await db.execute(
        "INSERT INTO materias (nombre, nombre_normalizado) VALUES (?, ?)",
        [nombre, nombreNormalizado]
    );

    res.status(201).json({
        mensaje: "Materia creada correctamente",
        materia: {
            id: resultado.insertId,
            nombre
        }
    });
});

export default router;