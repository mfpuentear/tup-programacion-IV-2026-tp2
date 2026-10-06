import express from "express";
import { db } from "./db.js";
import {
  validarId,
  validarMateria,
  verificarValidaciones,
} from "./validaciones.js";

const router = express.Router();

// GET para entregar listado de materias
router.get("/", async (req, res) => {
  const [materias] = await db.execute("SELECT * FROM materias");
  res.send(materias);
});

// GET para entregar detalle de materia
router.get("/:id", validarId, verificarValidaciones, async (req, res) => {
  // Obtengo id
  const id = Number(req.params.id);

  const [materias] = await db.execute("SELECT * FROM materias WHERE id=?", [id]);

  if (materias.length === 0) {
    return res.status(404).send("Materia no encontrada");
  }

  res.send(materias[0]);
});

// POST para crear materia
router.post("/", validarMateria, verificarValidaciones, async (req, res) => {
  // Obtengo body
  const { nombre } = req.body;

  const [result] = await db.execute("INSERT INTO materias (nombre) VALUES (?)", [
    nombre,
  ]);

  res.status(201).send({ id: result.insertId, nombre });
});

// PUT para modificar materia a partir de un id
router.put(
  "/:id",
  validarId,
  validarMateria,
  verificarValidaciones,
  async (req, res) => {
    // Obtengo id
    const id = Number(req.params.id);

    // Verificar que este presente la materia
    const [materias] = await db.execute("SELECT * FROM materias WHERE id=?", [
      id,
    ]);

    if (materias.length === 0) {
      return res.status(404).send("Materia no encontrada");
    }

    const { nombre } = req.body;

    await db.execute("UPDATE materias SET nombre=? WHERE id=?", [nombre, id]);

    // Responder con materia modificada
    res.send({ id, nombre });
  },
);

// DELETE para quitar una materia a partir de un id
router.delete("/:id", validarId, verificarValidaciones, async (req, res) => {
  // Obtengo id
  const id = Number(req.params.id);

  // Verificar que este presente la materia
  const [materias] = await db.execute("SELECT * FROM materias WHERE id=?", [id]);

  if (materias.length === 0) {
    return res.status(404).send("Materia no encontrada");
  }

  // Verificar que la materia no tenga calificaciones
  const [calificaciones] = await db.execute(
    "SELECT id FROM calificaciones WHERE materia_id=?",
    [id],
  );

  if (calificaciones.length > 0) {
    return res
      .status(409)
      .send("No se puede quitar la materia porque tiene calificaciones");
  }

  await db.execute("DELETE FROM materias WHERE id=?", [id]);

  // Retornar materia quitada
  res.send(materias[0]);
});

// GET para entregar las calificaciones de una materia
router.get(
  "/:id/calificaciones",
  validarId,
  verificarValidaciones,
  async (req, res) => {
    const id = Number(req.params.id);

    let sql =
      "SELECT c.id, c.alumno, m.nombre AS materia, c.nota1, c.nota2, c.nota3 " +
      "FROM calificaciones c " +
      "JOIN materias m ON c.materia_id = m.id " +
      "WHERE m.id = ?";

    const [calificaciones] = await db.execute(sql, [id]);

    res.send(calificaciones);
  },
);

export default router;