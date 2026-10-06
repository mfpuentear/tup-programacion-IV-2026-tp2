import express from "express";
import { db } from "./db.js";
import {
  validarFiltrosCalificaciones,
  validarId,
  validarCalificacion,
  verificarValidaciones,
} from "./validaciones.js";

const router = express.Router();

// GET para entregar listado de calificaciones
router.get(
  "/",
  validarFiltrosCalificaciones,
  verificarValidaciones,
  async (req, res) => {
    const filtros = [];
    const parametros = [];

    const { materiaId, alumno } = req.query;

    if (materiaId !== undefined) {
      filtros.push("c.materia_id = ?");
      parametros.push(Number(materiaId));
    }

    if (alumno) {
      filtros.push("c.alumno LIKE ?");
      parametros.push(`%${alumno}%`);
    }

    let sql =
      "SELECT c.id, c.alumno, m.nombre AS materia, c.nota1, c.nota2, c.nota3 " +
      "FROM calificaciones c " +
      "JOIN materias m ON c.materia_id = m.id";

    if (filtros.length > 0) {
      sql += " WHERE " + filtros.join(" AND ");
    }

    const [calificaciones] = await db.execute(sql, parametros);
    res.send(calificaciones);
  },
);

// GET para entregar detalle de calificacion
router.get("/:id", validarId, verificarValidaciones, async (req, res) => {
  // Obtengo id
  const id = Number(req.params.id);

  let sql =
    "SELECT c.id, c.alumno, m.nombre AS materia, c.nota1, c.nota2, c.nota3 " +
    "FROM calificaciones c " +
    "JOIN materias m ON c.materia_id = m.id " +
    "WHERE c.id = ?";

  const [calificaciones] = await db.execute(sql, [id]);

  if (calificaciones.length === 0) {
    return res.status(404).send("Calificacion no encontrada");
  }

  res.send(calificaciones[0]);
});

// POST para crear calificacion
router.post(
  "/",
  validarCalificacion,
  verificarValidaciones,
  async (req, res) => {
    // Obtengo body
    const { alumno, materiaId, notas } = req.body;
    const [nota1, nota2, nota3] = notas.map(Number);

    const [result] = await db.execute(
      "INSERT INTO calificaciones (alumno, materia_id, nota1, nota2, nota3) VALUES (?,?,?,?,?)",
      [alumno, Number(materiaId), nota1, nota2, nota3],
    );

    res.status(201).send({
      id: result.insertId,
      alumno,
      materiaId: Number(materiaId),
      nota1,
      nota2,
      nota3,
    });
  },
);

// PUT para modificar calificacion a partir de un id
router.put(
  "/:id",
  validarId,
  validarCalificacion,
  verificarValidaciones,
  async (req, res) => {
    // Obtengo id
    const id = Number(req.params.id);

    // Verificar que este presente la calificacion
    const [calificaciones] = await db.execute(
      "SELECT * FROM calificaciones WHERE id=?",
      [id],
    );

    if (calificaciones.length === 0) {
      return res.status(404).send("Calificacion no encontrada");
    }

    const { alumno, materiaId, notas } = req.body;
    const [nota1, nota2, nota3] = notas.map(Number);

    await db.execute(
      "UPDATE calificaciones SET alumno=?, materia_id=?, nota1=?, nota2=?, nota3=? WHERE id=?",
      [alumno, Number(materiaId), nota1, nota2, nota3, id],
    );

    // Responder con calificacion modificada
    res.send({ id, alumno, materiaId: Number(materiaId), nota1, nota2, nota3 });
  },
);

// DELETE para quitar una calificacion a partir de un id
router.delete("/:id", validarId, verificarValidaciones, async (req, res) => {
  // Obtengo id
  const id = Number(req.params.id);

  // Verificar que este presente la calificacion
  const [calificaciones] = await db.execute(
    "SELECT * FROM calificaciones WHERE id=?",
    [id],
  );

  if (calificaciones.length === 0) {
    return res.status(404).send("Calificacion no encontrada");
  }

  await db.execute("DELETE FROM calificaciones WHERE id=?", [id]);

  // Retornar calificacion quitada
  res.send(calificaciones[0]);
});

export default router;