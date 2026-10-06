import express from "express";
import { db } from "./db.js";
import {
  MENSAJE_CALIFICACION_DUPLICADA,
  validarCalificacion,
  validarFiltrosCalificaciones,
  validarId,
  verificarValidaciones,
} from "./validaciones.js";

const router = express.Router();

const SELECT =
  "SELECT c.id, c.alumno, c.materia_id AS materiaId, m.nombre AS materia, " +
  "c.nota1, c.nota2, c.nota3 " +
  "FROM calificaciones c " +
  "JOIN materias m ON c.materia_id = m.id";

// Arma la respuesta con las tres notas en una lista
const aCalificacion = (fila) => ({
  id: fila.id,
  alumno: fila.alumno,
  materiaId: fila.materiaId,
  materia: fila.materia,
  notas: [fila.nota1, fila.nota2, fila.nota3],
});

// GET para entregar listado de calificaciones (filtros opcionales)
router.get(
  "/",
  validarFiltrosCalificaciones,
  verificarValidaciones,
  async (req, res) => {
    const filtros = [];
    const parametros = [];

    const { alumno, materiaId } = req.query;

    if (alumno) {
      filtros.push("c.alumno LIKE ?");
      parametros.push(`%${alumno}%`);
    }

    if (materiaId !== undefined) {
      filtros.push("c.materia_id = ?");
      parametros.push(Number(materiaId));
    }

    let sql = SELECT;
    if (filtros.length > 0) {
      sql += " WHERE " + filtros.join(" AND ");
    }
    sql += " ORDER BY c.alumno, m.nombre";

    const [calificaciones] = await db.execute(sql, parametros);
    res.send(calificaciones.map(aCalificacion));
  },
);

// GET para entregar detalle de calificacion
router.get("/:id", validarId, verificarValidaciones, async (req, res) => {
  const id = Number(req.params.id);

  const [calificaciones] = await db.execute(SELECT + " WHERE c.id = ?", [id]);

  if (calificaciones.length === 0) {
    return res.status(404).send("Calificación no encontrada");
  }

  res.send(aCalificacion(calificaciones[0]));
});

// POST para crear calificacion
router.post(
  "/",
  validarCalificacion,
  verificarValidaciones,
  async (req, res) => {
    const { alumno, materiaId, notas } = req.body;
    const [nota1, nota2, nota3] = notas;

    try {
      const [result] = await db.execute(
        "INSERT INTO calificaciones (alumno, materia_id, nota1, nota2, nota3) VALUES (?,?,?,?,?)",
        [alumno, materiaId, nota1, nota2, nota3],
      );
      res.status(201).send({ id: result.insertId, alumno, materiaId, notas });
    } catch (e) {
      // Respaldo de la regla de unicidad (por ejemplo, dos pedidos simultaneos)
      if (e.code === "ER_DUP_ENTRY") {
        return res
          .status(409)
          .json({ mensaje: MENSAJE_CALIFICACION_DUPLICADA });
      }
      throw e;
    }
  },
);

// PUT para modificar calificacion
router.put(
  "/:id",
  validarId,
  validarCalificacion,
  verificarValidaciones,
  async (req, res) => {
    const id = Number(req.params.id);
    const { alumno, materiaId, notas } = req.body;
    const [nota1, nota2, nota3] = notas;

    try {
      const [result] = await db.execute(
        "UPDATE calificaciones SET alumno = ?, materia_id = ?, nota1 = ?, nota2 = ?, nota3 = ? WHERE id = ?",
        [alumno, materiaId, nota1, nota2, nota3, id],
      );

      if (result.affectedRows === 0) {
        return res.status(404).send("Calificación no encontrada");
      }

      res.send({ id, alumno, materiaId, notas });
    } catch (e) {
      if (e.code === "ER_DUP_ENTRY") {
        return res
          .status(409)
          .json({ mensaje: MENSAJE_CALIFICACION_DUPLICADA });
      }
      throw e;
    }
  },
);

// DELETE para eliminar calificacion
router.delete("/:id", validarId, verificarValidaciones, async (req, res) => {
  const id = Number(req.params.id);

  const [result] = await db.execute("DELETE FROM calificaciones WHERE id = ?", [
    id,
  ]);

  if (result.affectedRows === 0) {
    return res.status(404).send("Calificación no encontrada");
  }

  res.sendStatus(204);
});

export default router;