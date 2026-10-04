import express from "express";
import { body, query, matchedData } from "express-validator";
import { db } from "./db.js";
import { verificarValidaciones, validarId } from "./validaciones.js";

const router = express.Router();

// trae cada calificación con el nombre del alumno y de la materia
const SELECT_CALIFICACIONES = `
  SELECT c.id, c.alumno_id, a.nombre AS alumno, c.materia_id, m.nombre AS materia,
         c.nota1, c.nota2, c.nota3
  FROM calificaciones c
  JOIN alumnos a ON a.id = c.alumno_id
  JOIN materias m ON m.id = c.materia_id`;

const formatear = (fila) => ({
    id: fila.id,
    alumnoId: fila.alumno_id,
    alumno: fila.alumno,
    materiaId: fila.materia_id,
    materia: fila.materia,
    notas: [fila.nota1, fila.nota2, fila.nota3],
});

const buscarPorId = async (id) => {
    const [rows] = await db.execute(`${SELECT_CALIFICACIONES} WHERE c.id = ?`, [id]);
    return rows[0];
};

const existe = async (tabla, id) => {
    const [rows] = await db.execute(`SELECT id FROM ${tabla} WHERE id = ?`, [id]);
    return rows.length > 0;
};

const validarCalificacion = [
    body("alumnoId")
        .isInt({ min: 1 })
        .withMessage("alumnoId tiene que ser un entero positivo")
        .bail()
        .toInt()
        .custom(async (alumnoId) => {
            if (!(await existe("alumnos", alumnoId))) {
                throw new Error("El alumno no existe");
            }
        }),
    body("materiaId")
        .isInt({ min: 1 })
        .withMessage("materiaId tiene que ser un entero positivo")
        .bail()
        .toInt()
        .custom(async (materiaId) => {
            if (!(await existe("materias", materiaId))) {
                throw new Error("La materia no existe");
            }
        })
        .bail()
        // un alumno no puede tener dos registros en la misma materia
        .custom(async (materiaId, { req }) => {
            const alumnoId = Number(req.body.alumnoId);
            const id = Number(req.params.id) || 0;
            const [rows] = await db.execute(
                "SELECT id FROM calificaciones WHERE alumno_id = ? AND materia_id = ? AND id <> ?",
                [alumnoId, materiaId, id]
            );
            if (rows.length > 0) {
                throw new Error("El alumno ya tiene calificaciones en esa materia");
            }
        }),
    body("notas")
        .isArray({ min: 3, max: 3 })
        .withMessage("Tienen que ser exactamente 3 notas"),
    body("notas.*")
        .isInt({ min: 1, max: 10 })
        .withMessage("Cada nota tiene que ser un entero del 1 al 10")
        .toInt(),
];

// GET /calificaciones?alumnoId=1&materiaId=2 (los dos filtros son opcionales)
router.get(
    "/",
    query("alumnoId").optional().isInt({ min: 1 }).withMessage("alumnoId tiene que ser un entero positivo").toInt(),
    query("materiaId").optional().isInt({ min: 1 }).withMessage("materiaId tiene que ser un entero positivo").toInt(),
    verificarValidaciones,
    async (req, res) => {
        const { alumnoId, materiaId } = matchedData(req);

        let sql = `${SELECT_CALIFICACIONES} WHERE 1 = 1`;
        const valores = [];
        if (alumnoId !== undefined) {
            sql += " AND c.alumno_id = ?";
            valores.push(alumnoId);
        }
        if (materiaId !== undefined) {
            sql += " AND c.materia_id = ?";
            valores.push(materiaId);
        }

        const [rows] = await db.execute(sql, valores);
        res.json(rows.map(formatear));
    }
);

router.get("/:id", validarId, verificarValidaciones, async (req, res) => {
    const { id } = matchedData(req);
    const calificacion = await buscarPorId(id);
    if (!calificacion) {
        return res.status(404).json({ error: "Calificación no encontrada" });
    }
    res.json(formatear(calificacion));
});

router.post("/", validarCalificacion, verificarValidaciones, async (req, res) => {
    const { alumnoId, materiaId, notas } = matchedData(req);

    const [result] = await db.execute(
        "INSERT INTO calificaciones (alumno_id, materia_id, nota1, nota2, nota3) VALUES (?, ?, ?, ?, ?)",
        [alumnoId, materiaId, ...notas]
    );

    res.status(201).json(formatear(await buscarPorId(result.insertId)));
});

router.put("/:id", validarId, validarCalificacion, verificarValidaciones, async (req, res) => {
    const { id, alumnoId, materiaId, notas } = matchedData(req);

    if (!(await buscarPorId(id))) {
        return res.status(404).json({ error: "Calificación no encontrada" });
    }

    await db.execute(
        "UPDATE calificaciones SET alumno_id = ?, materia_id = ?, nota1 = ?, nota2 = ?, nota3 = ? WHERE id = ?",
        [alumnoId, materiaId, ...notas, id]
    );

    res.json(formatear(await buscarPorId(id)));
});

router.delete("/:id", validarId, verificarValidaciones, async (req, res) => {
    const { id } = matchedData(req);
    const [result] = await db.execute("DELETE FROM calificaciones WHERE id = ?", [id]);
    if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Calificación no encontrada" });
    }
    res.status(204).end();
});

export default router;