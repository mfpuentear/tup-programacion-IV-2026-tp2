import express from "express";
import { db } from "./db.js";
import {
    validarFiltroEstado,
    validarId,
    validarTarea,
    validarEstadoParcial,
    verificarValidaciones
} from "./validaciones.js";

const router = express.Router();

function normalizarNombre(nombre) {
    return nombre.trim().toLowerCase();
}

function convertirCompletada(valor) {
    return valor === true || valor === "true" || valor === 1 || valor === "1";
}

router.get(
    "/",
    validarFiltroEstado,
    verificarValidaciones,
    async (req, res) => {
        const { estado } = req.query;

    let sql = "SELECT id, nombre, completada FROM tareas";
    const valores = [];

    if (estado === "completadas") {
        sql += " WHERE completada = ?";
        valores.push(true);
    }

    if (estado === "pendientes") {
        sql += " WHERE completada = ?";
        valores.push(false);
    }

    const [tareas] = await db.execute(sql, valores);

    res.status(200).json({
        cantidad: tareas.length,
        tareas: tareas.map((tarea) => ({
            ...tarea,
            completada: Boolean(tarea.completada)
            }))
        });
    }
);

router.get("/:id", validarId, verificarValidaciones, async (req, res) => {
    const id = Number(req.params.id);

    const [tareas] = await db.execute(
        "SELECT id, nombre, completada FROM tareas WHERE id = ?",
        [id]
    );

    if (tareas.length === 0) {
        return res.status(404).json({
            mensaje: "Tarea no encontrada"
        });
    }

    res.status(200).json({
        ...tareas[0],
        completada: Boolean(tareas[0].completada)
    });
});

router.post("/", validarTarea, verificarValidaciones, async (req, res) => {
    const nombre = req.body.nombre.trim();
    const completada = convertirCompletada(req.body.completada);
    const nombreNormalizado = normalizarNombre(nombre);

    const [resultado] = await db.execute(
        "INSERT INTO tareas (nombre, completada, nombre_normalizado) VALUES (?, ?, ?)",
        [nombre, completada, nombreNormalizado]
    );

    res.status(201).json({
        mensaje: "Tarea creada correctamente",
        tarea: {
            id: resultado.insertId,
            nombre,
            completada
        }
    });
});

router.put(
    "/:id",
    validarId,
    validarTarea,
    verificarValidaciones,
    async (req, res) => {
        const id = Number(req.params.id);
        const nombre = req.body.nombre.trim();
        const completada = convertirCompletada(req.body.completada);
        const nombreNormalizado = normalizarNombre(nombre);

    const [tareas] = await db.execute("SELECT id FROM tareas WHERE id = ?", [
        id
    ]);

    if (tareas.length === 0) {
        return res.status(404).json({
            mensaje: "Tarea no encontrada"
        });
    }

    await db.execute(
        "UPDATE tareas SET nombre = ?, completada = ?, nombre_normalizado = ? WHERE id = ?",
        [nombre, completada, nombreNormalizado, id]
    );

    res.status(200).json({
        mensaje: "Tarea actualizada correctamente",
        tarea: {
            id,
            nombre,
            completada
        }
    });
    }
);

router.patch(
    "/:id/estado",
    validarId,
    validarEstadoParcial,
    verificarValidaciones,
    async (req, res) => {
        const id = Number(req.params.id);
        const completada = convertirCompletada(req.body.completada);

    const [tareas] = await db.execute("SELECT id FROM tareas WHERE id = ?", [
        id
    ]);

    if (tareas.length === 0) {
        return res.status(404).json({
            mensaje: "Tarea no encontrada"
        });
    }

    await db.execute("UPDATE tareas SET completada = ? WHERE id = ?", [
        completada,
        id
    ]);

    res.status(200).json({
        mensaje: "Estado actualizado correctamente",
        tarea: {
            id,
            completada
        }
    });
    }
);

router.delete("/:id", validarId, verificarValidaciones, async (req, res) => {
    const id = Number(req.params.id);

    const [resultado] = await db.execute("DELETE FROM tareas WHERE id = ?", [id]);

    if (resultado.affectedRows === 0) {
        return res.status(404).json({
        mensaje: "Tarea no encontrada"
    });
}

    res.status(200).json({
        mensaje: "Tarea eliminada correctamente"
    });
});

export default router;