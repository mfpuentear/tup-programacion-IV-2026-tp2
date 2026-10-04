import express from "express";
import { matchedData } from "express-validator";
import { db } from "./db.js";
import { verificarValidaciones, validarId, validarNombre } from "./validaciones.js";

const router = express.Router();

const buscarPorId = async (id) => {
    const [rows] = await db.execute("SELECT * FROM alumnos WHERE id = ?", [id]);
    return rows[0];
};

// solo letras (con acentos), espacios y apóstrofos: "José María", "O'Higgins"
const validarAlumno = validarNombre()
    .bail()
    .matches(/^[\p{L}' ]+$/u)
    .withMessage("El nombre solo puede tener letras y espacios");

router.get("/", async (req, res) => {
    const [rows] = await db.execute("SELECT * FROM alumnos ORDER BY nombre");
    res.json(rows);
});

router.get("/:id", validarId, verificarValidaciones, async (req, res) => {
    const { id } = matchedData(req);
    const alumno = await buscarPorId(id);
    if (!alumno) {
        return res.status(404).json({ error: "Alumno no encontrado" });
    }
    res.json(alumno);
});

router.post("/", validarAlumno, verificarValidaciones, async (req, res) => {
    const { nombre } = matchedData(req);
    const [result] = await db.execute("INSERT INTO alumnos (nombre) VALUES (?)", [nombre]);
    res.status(201).json(await buscarPorId(result.insertId));
});

router.put("/:id", validarId, validarAlumno, verificarValidaciones, async (req, res) => {
    const { id, nombre } = matchedData(req);
    if (!(await buscarPorId(id))) {
        return res.status(404).json({ error: "Alumno no encontrado" });
    }
    await db.execute("UPDATE alumnos SET nombre = ? WHERE id = ?", [nombre, id]);
    res.json(await buscarPorId(id));
});

router.delete("/:id", validarId, verificarValidaciones, async (req, res) => {
    const { id } = matchedData(req);
    try {
        const [result] = await db.execute("DELETE FROM alumnos WHERE id = ?", [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Alumno no encontrado" });
        }
        res.status(204).end();
    } catch (error) {
        if (error.code === "ER_ROW_IS_REFERENCED_2") {
            return res.status(409).json({ error: "El alumno tiene calificaciones cargadas, no se puede eliminar" });
        }
        throw error;
    }
});

export default router;