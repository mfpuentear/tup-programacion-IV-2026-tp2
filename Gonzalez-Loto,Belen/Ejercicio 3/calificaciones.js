import express from "express";
import { db } from "./db.js";
import {
    validarFiltrosCalificaciones,
    validarId,
    validarCalificacion,
    verificarValidaciones
} from "./validaciones.js";

const router = express.Router();

function normalizarTexto(texto) {
    return texto.trim().toLowerCase();
}

function calcularPromedio(notas) {
    const suma = notas.reduce((total, nota) => total + nota, 0);
    return Number((suma / notas.length).toFixed(2));
}

function obtenerCondicion(promedio) {
    if (promedio >= 8) {
        return "promocionado";
    }

    if (promedio >= 6) {
        return "aprobado";
    }

    return "reprobado";
}

function formatearCalificacion(calificacion) {
    const notas = [
        Number(calificacion.nota_1),
        Number(calificacion.nota_2),
        Number(calificacion.nota_3)
    ];

    const promedio = calcularPromedio(notas);

    return {
        id: calificacion.id,
        alumnoNombre: calificacion.alumno_nombre,
        materia: {
        id: calificacion.materia_id,
        nombre: calificacion.materia_nombre
        },
        notas,
        promedio,
        condicion: obtenerCondicion(promedio)
    };
}

router.get(
    "/",
    validarFiltrosCalificaciones,
    verificarValidaciones,
    async (req, res) => {
        const filtros = [];
        const valores = [];

    const { alumno, materiaId } = req.query;

    if (alumno !== undefined) {
        filtros.push("c.alumno_normalizado LIKE ?");
        valores.push(`%${normalizarTexto(alumno)}%`);
    }

    if (materiaId !== undefined) {
        filtros.push("c.materia_id = ?");
        valores.push(Number(materiaId));
    }

    let sql =
        "SELECT c.id, c.alumno_nombre, c.materia_id, m.nombre AS materia_nombre, " +
        "c.nota_1, c.nota_2, c.nota_3 " +
        "FROM calificaciones c " +
        "JOIN materias m ON c.materia_id = m.id";

    if (filtros.length > 0) {
        sql += " WHERE " + filtros.join(" AND ");
    }

    sql += " ORDER BY c.alumno_nombre, m.nombre";

    const [calificaciones] = await db.execute(sql, valores);

    res.status(200).json({
        cantidad: calificaciones.length,
        calificaciones: calificaciones.map(formatearCalificacion)
        });
    }
);

router.get("/:id", validarId, verificarValidaciones, async (req, res) => {
    const id = Number(req.params.id);

    const [calificaciones] = await db.execute(
        "SELECT c.id, c.alumno_nombre, c.materia_id, m.nombre AS materia_nombre, " +
        "c.nota_1, c.nota_2, c.nota_3 " +
        "FROM calificaciones c " +
        "JOIN materias m ON c.materia_id = m.id " +
        "WHERE c.id = ?",
        [id]
    );

    if (calificaciones.length === 0) {
        return res.status(404).json({
            mensaje: "Calificacion no encontrada"
        });
    }

    res.status(200).json(formatearCalificacion(calificaciones[0]));
});

router.post(
    "/",
    validarCalificacion,
    verificarValidaciones,
    async (req, res) => {
        const alumnoNombre = req.body.alumnoNombre.trim();
        const alumnoNormalizado = normalizarTexto(alumnoNombre);
        const materiaId = Number(req.body.materiaId);
        const notas = req.body.notas.map((nota) => Number(nota));

    const [resultado] = await db.execute(
        "INSERT INTO calificaciones " +
        "(alumno_nombre, alumno_normalizado, materia_id, nota_1, nota_2, nota_3) " +
        "VALUES (?, ?, ?, ?, ?, ?)",
        [alumnoNombre, alumnoNormalizado, materiaId, notas[0], notas[1], notas[2]]
    );

    res.status(201).json({
        mensaje: "Calificacion creada correctamente",
        calificacion: {
            id: resultado.insertId,
            alumnoNombre,
            materiaId,
            notas,
            promedio: calcularPromedio(notas),
            condicion: obtenerCondicion(calcularPromedio(notas))
        }
        });
    }
);

router.put(
    "/:id",
    validarId,
    validarCalificacion,
    verificarValidaciones,
    async (req, res) => {
        const id = Number(req.params.id);
        const alumnoNombre = req.body.alumnoNombre.trim();
        const alumnoNormalizado = normalizarTexto(alumnoNombre);
        const materiaId = Number(req.body.materiaId);
        const notas = req.body.notas.map((nota) => Number(nota));

    const [calificaciones] = await db.execute(
        "SELECT id FROM calificaciones WHERE id = ?",
        [id]
        );

    if (calificaciones.length === 0) {
        return res.status(404).json({
            mensaje: "Calificacion no encontrada"
        });
    }

    await db.execute(
        "UPDATE calificaciones " +
            "SET alumno_nombre = ?, alumno_normalizado = ?, materia_id = ?, nota_1 = ?, nota_2 = ?, nota_3 = ? " +
            "WHERE id = ?",
        [
            alumnoNombre,
            alumnoNormalizado,
            materiaId,
            notas[0],
            notas[1],
            notas[2],
            id
        ]
    );

    res.status(200).json({
        mensaje: "Calificacion actualizada correctamente",
        calificacion: {
            id,
            alumnoNombre,
            materiaId,
            notas,
            promedio: calcularPromedio(notas),
            condicion: obtenerCondicion(calcularPromedio(notas))
        }
        });
    }
);

router.delete("/:id", validarId, verificarValidaciones, async (req, res) => {
    const id = Number(req.params.id);

    const [resultado] = await db.execute(
        "DELETE FROM calificaciones WHERE id = ?",
        [id]
    );

    if (resultado.affectedRows === 0) {
        return res.status(404).json({
            mensaje: "Calificacion no encontrada"
        });
    }

    res.status(200).json({
        mensaje: "Calificacion eliminada correctamente"
    });
});

export default router;