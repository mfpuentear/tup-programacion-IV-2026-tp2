import express from "express";
import { db } from "./db.js";
import {
  validarCalificacion,
  validarCalificacionParcial,
  validarFiltrosCalificaciones,
  validarId,
  verificarValidaciones,
} from "./validaciones.js";

const router = express.Router();

// obtener nombre de la columna de la tabla materias
const col = "nombre_materia";

// listar calificaciones
router.get("/", validarFiltrosCalificaciones, verificarValidaciones, async (req, res) => {
  try {
    const filtros = [];
    const parametros = [];

    const { alumno, materiaId, limit, offset } = req.query;

    if (alumno) {
      filtros.push("c.nombre LIKE ?");
      parametros.push(`%${alumno}%`);
    }

    if (materiaId) {
      filtros.push("c.materia_id = ?");
      parametros.push(Number(materiaId));
    }

    let sql =
      `SELECT c.id, c.nombre AS alumno, c.materia_id AS materiaId, m.${col} AS materia, ` +
      "c.nota1, c.nota2, c.nota3 " +
      "FROM ejercicio3 c " +
      "JOIN materias m ON c.materia_id = m.id";

    if (filtros.length > 0) {
      sql += " WHERE " + filtros.join(" AND ");
    }

    sql += " ORDER BY c.id ASC";

    if (limit !== undefined) {
      sql += " LIMIT ?";
      parametros.push(Number(limit));

      if (offset !== undefined) {
        sql += " OFFSET ?";
        parametros.push(Number(offset));
      }
    }

    const [filas] = await db.execute(sql, parametros);

    const calificaciones = filas.map((c) => ({
      id: c.id,
      alumno: c.alumno,
      materia: { id: c.materiaId, nombre: c.materia },
      notas: [Number(c.nota1), Number(c.nota2), Number(c.nota3)],
    }));

    res.send(calificaciones);
  } catch (error) {
    console.error(error.message);
    res.status(500).send({ error: error.message });
  }
});

// obtener calificacion por id
router.get("/:id", validarId, verificarValidaciones, async (req, res) => {
  try {
    const id = Number(req.params.id);

    const sql =
      `SELECT c.id, c.nombre AS alumno, c.materia_id AS materiaId, m.${col} AS materia, ` +
      "c.nota1, c.nota2, c.nota3 " +
      "FROM ejercicio3 c " +
      "JOIN materias m ON c.materia_id = m.id " +
      "WHERE c.id = ?";

    const [filas] = await db.execute(sql, [id]);

    if (filas.length === 0) {
      return res.status(404).send("Calificación no encontrada");
    }

    const c = filas[0];
    res.send({
      id: c.id,
      alumno: c.alumno,
      materia: { id: c.materiaId, nombre: c.materia },
      notas: [Number(c.nota1), Number(c.nota2), Number(c.nota3)],
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send({ error: error.message });
  }
});

// crear calificacion
router.post("/", validarCalificacion, verificarValidaciones, async (req, res) => {
  try {
    const alumno = req.body.alumno.trim().replace(/\s+/g, " ");
    const materiaId = Number(req.body.materiaId);
    const [n1, n2, n3] = req.body.notas.map(Number);

    // 1. ver si existe la materia
    const [materia] = await db.execute(`SELECT id, ${col} AS nombre FROM materias WHERE id = ?`, [materiaId]);
    if (materia.length === 0) {
      return res.status(400).send("La materia indicada no existe");
    }

    // 2. ver si el alumno ya tiene notas en esa materia
    const [duplicado] = await db.execute(
      "SELECT id FROM ejercicio3 WHERE LOWER(nombre) = LOWER(?) AND materia_id = ?",
      [alumno, materiaId],
    );
    if (duplicado.length > 0) {
      return res.status(409).send("Ya existe un registro para ese alumno en esa materia");
    }

    const [result] = await db.execute(
      "INSERT INTO ejercicio3 (nombre, materia_id, nota1, nota2, nota3) VALUES (?, ?, ?, ?, ?)",
      [alumno, materiaId, n1, n2, n3],
    );

    res.location(`/calificaciones/${result.insertId}`);
    res.status(201).send({
      id: result.insertId,
      alumno,
      materia: { id: materiaId, nombre: materia[0].nombre },
      notas: [n1, n2, n3],
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send({ error: error.message });
  }
});

// modificar calificacion (put completo)
router.put("/:id", validarId, validarCalificacion, verificarValidaciones, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const alumno = req.body.alumno.trim().replace(/\s+/g, " ");
    const materiaId = Number(req.body.materiaId);
    const [n1, n2, n3] = req.body.notas.map(Number);

    // ver si existe la calificacion
    const [existente] = await db.execute("SELECT id FROM ejercicio3 WHERE id = ?", [id]);
    if (existente.length === 0) {
      return res.status(404).send("Calificación no encontrada");
    }

    // ver si la materia existe
    const [materia] = await db.execute(`SELECT id, ${col} AS nombre FROM materias WHERE id = ?`, [materiaId]);
    if (materia.length === 0) {
      return res.status(400).send("La materia indicada no existe");
    }

    // ver que no quede repetido alumno y materia en otro registro
    const [duplicados] = await db.execute(
      "SELECT id FROM ejercicio3 WHERE LOWER(nombre) = LOWER(?) AND materia_id = ? AND id <> ?",
      [alumno, materiaId, id],
    );
    if (duplicados.length > 0) {
      return res.status(409).send("Ya existe otro registro para ese alumno en esa materia");
    }

    await db.execute(
      "UPDATE ejercicio3 SET nombre = ?, materia_id = ?, nota1 = ?, nota2 = ?, nota3 = ? WHERE id = ?",
      [alumno, materiaId, n1, n2, n3, id],
    );

    res.send({
      id,
      alumno,
      materia: { id: materiaId, nombre: materia[0].nombre },
      notas: [n1, n2, n3],
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send({ error: error.message });
  }
});

// modificacion parcial (patch)
router.patch("/:id", validarId, validarCalificacionParcial, verificarValidaciones, async (req, res) => {
  try {
    const id = Number(req.params.id);

    const [existentes] = await db.execute(
      `SELECT c.id, c.nombre, c.materia_id, m.${col} AS materia_nombre, c.nota1, c.nota2, c.nota3 ` +
      "FROM ejercicio3 c JOIN materias m ON c.materia_id = m.id WHERE c.id = ?",
      [id],
    );

    if (existentes.length === 0) {
      return res.status(404).send("Calificación no encontrada");
    }

    const actual = existentes[0];
    const nuevoAlumno = req.body.alumno !== undefined ? req.body.alumno.trim().replace(/\s+/g, " ") : actual.nombre;
    const nuevoMateriaId = req.body.materiaId !== undefined ? Number(req.body.materiaId) : actual.materia_id;

    // si cambia materia, verificar que exista
    let nombreMateria = actual.materia_nombre;
    if (req.body.materiaId !== undefined) {
      const [materia] = await db.execute(`SELECT id, ${col} AS nombre FROM materias WHERE id = ?`, [nuevoMateriaId]);
      if (materia.length === 0) {
        return res.status(400).send("La materia indicada no existe");
      }
      nombreMateria = materia[0].nombre;
    }

    // si cambia alumno o materia, verificar unicidad
    if (req.body.alumno !== undefined || req.body.materiaId !== undefined) {
      const [duplicados] = await db.execute(
        "SELECT id FROM ejercicio3 WHERE LOWER(nombre) = LOWER(?) AND materia_id = ? AND id <> ?",
        [nuevoAlumno, nuevoMateriaId, id],
      );
      if (duplicados.length > 0) {
        return res.status(409).send("Ya existe otro registro para ese alumno en esa materia");
      }
    }

    const nuevasNotas = req.body.notas !== undefined
      ? req.body.notas.map(Number)
      : [Number(actual.nota1), Number(actual.nota2), Number(actual.nota3)];

    await db.execute(
      "UPDATE ejercicio3 SET nombre = ?, materia_id = ?, nota1 = ?, nota2 = ?, nota3 = ? WHERE id = ?",
      [nuevoAlumno, nuevoMateriaId, nuevasNotas[0], nuevasNotas[1], nuevasNotas[2], id],
    );

    res.send({
      id,
      alumno: nuevoAlumno,
      materia: { id: nuevoMateriaId, nombre: nombreMateria },
      notas: nuevasNotas,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send({ error: error.message });
  }
});

// eliminar calificacion
router.delete("/:id", validarId, verificarValidaciones, async (req, res) => {
  try {
    const id = Number(req.params.id);

    const [result] = await db.execute("DELETE FROM ejercicio3 WHERE id = ?", [id]);

    if (result.affectedRows === 0) {
      return res.status(404).send("Calificación no encontrada");
    }

    res.status(204).send();
  } catch (error) {
    console.error(error.message);
    res.status(500).send({ error: error.message });
  }
});

export default router;
