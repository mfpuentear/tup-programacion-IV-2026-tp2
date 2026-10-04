import express from "express";
import { db } from "./db.js";
import { validarId, validarMateria, verificarValidaciones } from "./validaciones.js";

const router = express.Router();

// GET para entregar listado de materias
router.get("/", async (req, res) => {
  const [materias] = await db.execute("SELECT * FROM materias ORDER BY nombre");
  res.send(materias);
});

// GET para entregar una materia
router.get("/:id", validarId, verificarValidaciones, async (req, res) => {
  const id = Number(req.params.id);

  const [materias] = await db.execute("SELECT * FROM materias WHERE id = ?", [id]);

  if (materias.length === 0) {
    return res.status(404).send({ mensaje: "Materia no encontrada" });
  }

  res.send(materias[0]);
});

// GET para entregar las calificaciones de una materia
router.get(
  "/:id/calificaciones",
  validarId,
  verificarValidaciones,
  async (req, res) => {
    const id = Number(req.params.id);

    const [materias] = await db.execute("SELECT * FROM materias WHERE id = ?", [id]);

    if (materias.length === 0) {
      return res.status(404).send({ mensaje: "Materia no encontrada" });
    }

    const [calificaciones] = await db.execute(
      "SELECT id, alumno, nota1, nota2, nota3 FROM calificaciones WHERE materia_id = ? ORDER BY alumno",
      [id],
    );

    res.send({
      materia: materias[0],
      calificaciones: calificaciones.map((c) => ({
        id: c.id,
        alumno: c.alumno,
        notas: [c.nota1, c.nota2, c.nota3],
      })),
    });
  },
);

// POST para crear materia
router.post("/", validarMateria, verificarValidaciones, async (req, res) => {
  const { nombre } = req.body;

  try {
    const [result] = await db.execute("INSERT INTO materias (nombre) VALUES (?)", [nombre]);
    res.status(201).send({ id: result.insertId, nombre });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).send({ mensaje: "Ya existe una materia con ese nombre" });
    }
    throw error;
  }
});

// PUT para modificar materia
router.put(
  "/:id",
  validarId,
  validarMateria,
  verificarValidaciones,
  async (req, res) => {
    const id = Number(req.params.id);
    const { nombre } = req.body;

    try {
      const [result] = await db.execute(
        "UPDATE materias SET nombre = ? WHERE id = ?",
        [nombre, id],
      );

      if (result.affectedRows === 0) {
        return res.status(404).send({ mensaje: "Materia no encontrada" });
      }

      res.send({ id, nombre });
    } catch (error) {
      if (error.code === "ER_DUP_ENTRY") {
        return res.status(409).send({ mensaje: "Ya existe una materia con ese nombre" });
      }
      throw error;
    }
  },
);

// DELETE para eliminar materia
router.delete("/:id", validarId, verificarValidaciones, async (req, res) => {
  const id = Number(req.params.id);

  try {
    const [result] = await db.execute("DELETE FROM materias WHERE id = ?", [id]);

    if (result.affectedRows === 0) {
      return res.status(404).send({ mensaje: "Materia no encontrada" });
    }

    res.status(204).send();
  } catch (error) {
    // La clave foránea impide borrar una materia que tiene calificaciones
    if (error.code === "ER_ROW_IS_REFERENCED_2") {
      return res.status(409).send({
        mensaje: "No se puede eliminar la materia porque tiene calificaciones registradas",
      });
    }
    throw error;
  }
});

export default router;