import express from "express";
import { db } from "./db.js";
import {
  validarFiltrosMaterias,
  validarId,
  validarMateria,
  verificarValidaciones,
} from "./validaciones.js";

const router = express.Router();

// obtener nombre de la columna de materias
const col = "nombre_materia";

// listar materias
router.get("/", validarFiltrosMaterias, verificarValidaciones, async (req, res) => {
  try {
    const filtros = [];
    const parametros = [];

    const { buscar, limit, offset } = req.query;

    if (buscar) {
      filtros.push(`${col} LIKE ?`);
      parametros.push(`%${buscar}%`);
    }

    let sql = `SELECT id, ${col} AS nombre FROM materias`;

    if (filtros.length > 0) {
      sql += " WHERE " + filtros.join(" AND ");
    }

    sql += " ORDER BY id ASC";

    if (limit !== undefined) {
      sql += " LIMIT ?";
      parametros.push(Number(limit));

      if (offset !== undefined) {
        sql += " OFFSET ?";
        parametros.push(Number(offset));
      }
    }

    const [materias] = await db.execute(sql, parametros);
    res.send(materias);
  } catch (error) {
    console.error(error.message);
    res.status(500).send({ error: error.message });
  }
});

// obtener materia por id
router.get("/:id", validarId, verificarValidaciones, async (req, res) => {
  try {
    const id = Number(req.params.id);

    const [materias] = await db.execute(`SELECT id, ${col} AS nombre FROM materias WHERE id = ?`, [id]);

    if (materias.length === 0) {
      return res.status(404).send("Materia no encontrada");
    }

    res.send(materias[0]);
  } catch (error) {
    console.error(error.message);
    res.status(500).send({ error: error.message });
  }
});

// crear materia
router.post("/", validarMateria, verificarValidaciones, async (req, res) => {
  try {
    const nombre = req.body.nombre.trim();

    // revisar si ya existe la materia
    const [existente] = await db.execute(
      `SELECT id FROM materias WHERE LOWER(${col}) = LOWER(?)`,
      [nombre],
    );

    if (existente.length > 0) {
      return res.status(409).send("Ya existe una materia con ese nombre");
    }

    const [result] = await db.execute(`INSERT INTO materias (${col}) VALUES (?)`, [nombre]);

    res.status(201).send({
      id: result.insertId,
      nombre,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send({ error: error.message });
  }
});

// modificar materia
router.put("/:id", validarId, validarMateria, verificarValidaciones, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const nombre = req.body.nombre.trim();

    const [existente] = await db.execute("SELECT id FROM materias WHERE id = ?", [id]);
    if (existente.length === 0) {
      return res.status(404).send("Materia no encontrada");
    }

    const [duplicados] = await db.execute(
      `SELECT id FROM materias WHERE LOWER(${col}) = LOWER(?) AND id <> ?`,
      [nombre, id],
    );
    if (duplicados.length > 0) {
      return res.status(409).send("Ya existe otra materia con ese nombre");
    }

    await db.execute(`UPDATE materias SET ${col} = ? WHERE id = ?`, [nombre, id]);

    res.send({ id, nombre });
  } catch (error) {
    console.error(error.message);
    res.status(500).send({ error: error.message });
  }
});

// eliminar materia
router.delete("/:id", validarId, verificarValidaciones, async (req, res) => {
  try {
    const id = Number(req.params.id);

    const [existente] = await db.execute("SELECT id FROM materias WHERE id = ?", [id]);
    if (existente.length === 0) {
      return res.status(404).send("Materia no encontrada");
    }

    // revisar si tiene notas asociadas
    const [calificaciones] = await db.execute(
      "SELECT id FROM ejercicio3 WHERE materia_id = ?",
      [id],
    );
    if (calificaciones.length > 0) {
      return res.status(409).send("No se puede eliminar la materia porque tiene calificaciones asociadas");
    }

    await db.execute("DELETE FROM materias WHERE id = ?", [id]);

    res.status(204).send();
  } catch (error) {
    console.error(error.message);
    res.status(500).send({ error: error.message });
  }
});

export default router;
