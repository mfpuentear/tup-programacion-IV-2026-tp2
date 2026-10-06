import express from "express";
import { db } from "./db.js";
import {
  MENSAJE_MATERIA_DUPLICADA,
  validarId,
  validarMateria,
  verificarValidaciones, 
} from "./validaciones.js";

const router = express.Router();

// GET para entregar listado de materias
router.get("/", async (req, res) => {
  const [materias] = await db.execute(
    "SELECT id, nombre FROM materias ORDER BY nombre",
  );
  res.send(materias);
});

// GET para entregar detalle de materia
router.get("/:id", validarId, verificarValidaciones, async (req, res) => {
  const id = Number(req.params.id);

  const [materias] = await db.execute(
    "SELECT id, nombre FROM materias WHERE id = ?",
    [id],
  );

  if (materias.length === 0) {
    return res.status(404).send("Materia no encontrada");
  }

  res.send(materias[0]);
});

// POST para crear materia
router.post("/", validarMateria, verificarValidaciones, async (req, res) => {
  const { nombre } = req.body;

  try {
    const [result] = await db.execute(
      "INSERT INTO materias (nombre) VALUES (?)",
      [nombre],
    );
    res.status(201).send({ id: result.insertId, nombre });
  } catch (e) {

    // Respaldo de la regla de unicidad por ejemplo, dos pedidos simultaneos
    if (e.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ mensaje: MENSAJE_MATERIA_DUPLICADA });
    }
    throw e;
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
        return res.status(404).send("Materia no encontrada");
      }

      res.send({ id, nombre });
    } catch (e) {
      if (e.code === "ER_DUP_ENTRY") {
        return res.status(409).json({ mensaje: MENSAJE_MATERIA_DUPLICADA });
      }
      throw e;
    }
  },
);

// DELETE para eliminar materia
router.delete("/:id", validarId, verificarValidaciones, async (req, res) => {
  const id = Number(req.params.id);

  try {
    const [result] = await db.execute("DELETE FROM materias WHERE id = ?", [id]);

    if (result.affectedRows === 0) {
      return res.status(404).send("Materia no encontrada");
    }

    res.sendStatus(204);
  } catch (e) {
    // La clave foranea impide borrar una materia con calificaciones
    if (e.code === "ER_ROW_IS_REFERENCED_2") {
      return res.status(409).json({
        mensaje:
          "No se puede eliminar la materia porque tiene calificaciones asociadas",
      });
    }
    
    throw e;
  }
});

export default router;