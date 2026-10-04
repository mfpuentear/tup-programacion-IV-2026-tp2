import express from "express";
import { matchedData } from "express-validator";
import { db } from "./db.js";
import { verificarValidaciones, validarId, validarNombre } from "./validaciones.js";

const router = express.Router();

const buscarPorId = async (id) => {
    const [rows] = await db.execute("SELECT * FROM materias WHERE id = ?", [id]);
    return rows[0];
};

// mismo criterio que en las tareas: sin distinguir mayúsculas ni acentos
const validarMateria = validarNombre()
    .bail()
    .custom(async (nombre, { req }) => {
        const id = Number(req.params.id) || 0;
        const [rows] = await db.execute("SELECT id FROM materias WHERE nombre = ? AND id <> ?", [nombre, id]);
        if (rows.length > 0) {
            throw new Error("Ya existe una materia con ese nombre");
        }
    });

router.get("/", async (req, res) => {
    const [rows] = await db.execute("SELECT * FROM materias ORDER BY nombre");
    res.json(rows);
});

router.get("/:id", validarId, verificarValidaciones, async (req, res) => {
    const { id } = matchedData(req);
    const materia = await buscarPorId(id);
    if (!materia) {
        return res.status(404).json({ error: "Materia no encontrada" });
    }
    res.json(materia);
});

router.post("/", validarMateria, verificarValidaciones, async (req, res) => {
    const { nombre } = matchedData(req);
    const [result] = await db.execute("INSERT INTO materias (nombre) VALUES (?)", [nombre]);
    res.status(201).json(await buscarPorId(result.insertId));
});

router.put("/:id", validarId, validarMateria, verificarValidaciones, async (req, res) => {
    const { id, nombre } = matchedData(req);
    if (!(await buscarPorId(id))) {
        return res.status(404).json({ error: "Materia no encontrada" });
    }
    await db.execute("UPDATE materias SET nombre = ? WHERE id = ?", [nombre, id]);
    res.json(await buscarPorId(id));
});

router.delete("/:id", validarId, verificarValidaciones, async (req, res) => {
    const { id } = matchedData(req);
    try {
        const [result] = await db.execute("DELETE FROM materias WHERE id = ?", [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Materia no encontrada" });
        }
        res.status(204).end();
    } catch (error) {
        // la clave foránea no deja borrar una materia que tiene calificaciones
        if (error.code === "ER_ROW_IS_REFERENCED_2") {
            return res.status(409).json({ error: "La materia tiene calificaciones cargadas, no se puede eliminar" });
        }
        throw error;
    }
});

export default router;