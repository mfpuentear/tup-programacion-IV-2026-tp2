import express from "express";
import { db } from "./db.js";
import {
  validarCalificacion,
  validarFiltrosCalificaciones,
  validarId,
  verificarValidaciones,
} from "./validaciones.js";

const router = express.Router();

// Consulta base: une cada calificación con el nombre de su materia
const SELECT_CALIFICACIONES =
  "SELECT c.id, c.alumno, c.materia_id, m.nombre AS materia, c.nota1, c.nota2, c.nota3 " +
  "FROM calificaciones c " +
  "JOIN materias m ON c.materia_id = m.id";

// Da formato a la respuesta: materia como objeto y notas como arreglo
function formatear(fila) {
  return {
    id: fila.id,
    alumno: fila.alumno,
    materia: { id: fila.materia_id, nombre: fila.materia },
    notas: [fila.nota1, fila.nota2, fila.nota3],
  };
}

// Busca una calificación por id (o devuelve null)
async function buscarPorId(id) {
  const [filas] = await db.execute(SELECT_CALIFICACIONES + " WHERE c.id = ?", [id]);
  return filas.length > 0 ? formatear(filas[0]) : null;
}

// GET para entregar listado de calificaciones (filtros opcionales)
router.get(
  "/",
  validarFiltrosCalificaciones,
  verificarValidaciones,
  async (req, res) => {
    const filtros = [];
    const parametros = [];

    const { alumno, materiaId } = req.query;

    if (alumno !== undefined) {
      filtros.push("c.alumno LIKE ?");
      parametros.push(`%${alumno}%`);
    }

    if (materiaId !== undefined) {
      filtros.push("c.materia_id = ?");
      parametros.push(Number(materiaId));
    }

    let sql = SELECT_CALIFICACIONES;

    if (filtros.length > 0) {
      sql += " WHERE " + filtros.join(" AND ");
    }

    sql += " ORDER BY c.alumno, m.nombre";

    const [filas] = await db.execute(sql, parametros);
    res.send(filas.map(formatear));
  },
);

// GET para entregar una calificación
router.get("/:id", validarId, verificarValidaciones, async (req, res) => {
  const calificacion = await buscarPorId(Number(req.params.id));

  if (!calificacion) {
    return res.status(404).send({ mensaje: "Calificación no encontrada" });
  }

  res.send(calificacion);
});

// POST para crear calificación
router.post("/", validarCalificacion, verificarValidaciones, async (req, res) => {
  const { alumno, materiaId, notas } = req.body;

  try {
    const [result] = await db.execute(
      "INSERT INTO calificaciones (alumno, materia_id, nota1, nota2, nota3) VALUES (?, ?, ?, ?, ?)",
      [alumno, materiaId, notas[0], notas[1], notas[2]],
    );
    res.status(201).send(await buscarPorId(result.insertId));
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).send({ mensaje: "El alumno ya tiene un registro en esa materia" });
    }
    throw error;
  }
});

// PUT para modificar calificación
router.put(
  "/:id",
  validarId,
  validarCalificacion,
  verificarValidaciones,
  async (req, res) => {
    const id = Number(req.params.id);
    const { alumno, materiaId, notas } = req.body;

    try {
      const [result] = await db.execute(
        "UPDATE calificaciones SET alumno = ?, materia_id = ?, nota1 = ?, nota2 = ?, nota3 = ? WHERE id = ?",
        [alumno, materiaId, notas[0], notas[1], notas[2], id],
      );

      if (result.affectedRows === 0) {
        return res.status(404).send({ mensaje: "Calificación no encontrada" });
      }

      res.send(await buscarPorId(id));
    } catch (error) {
      if (error.code === "ER_DUP_ENTRY") {
        return res.status(409).send({ mensaje: "El alumno ya tiene un registro en esa materia" });
      }
      throw error;
    }
  },
);

// DELETE para eliminar calificación
router.delete("/:id", validarId, verificarValidaciones, async (req, res) => {
  const id = Number(req.params.id);

  const [result] = await db.execute("DELETE FROM calificaciones WHERE id = ?", [id]);

  if (result.affectedRows === 0) {
    return res.status(404).send({ mensaje: "Calificación no encontrada" });
  }

  res.status(204).send();
});

export default router;