import express from "express";
import { db } from "./db.js";
import {
  validarFiltrosCalificaciones,
  validarId,
  validarCalificacionNueva,
  validarCalificacionCompleta,
  verificarValidaciones,
} from "./validaciones.js";

const router = express.Router();

// Consulta base con JOIN para traer tambien el nombre de la materia
const SQL_BASE =
  "SELECT c.id, c.alumno, c.materia_id, m.nombre AS materia, " +
  "c.nota1, c.nota2, c.nota3 " +
  "FROM calificaciones c JOIN materias m ON c.materia_id = m.id";

// Datos derivados de lectura: promedio y condicion segun la escala documentada
export function representarCalificacion(c) {
  const promedio =
    Math.round(((Number(c.nota1) + Number(c.nota2) + Number(c.nota3)) / 3) * 100) / 100;
  let condicion = "desaprobada";
  if (promedio >= 8) {
    condicion = "promocionada";
  } else if (promedio >= 6) {
    condicion = "regular";
  }
  return {
    id: c.id,
    alumno: c.alumno,
    materiaId: c.materia_id,
    materia: c.materia,
    nota1: Number(c.nota1),
    nota2: Number(c.nota2),
    nota3: Number(c.nota3),
    promedio,
    condicion,
  };
}

// Verifica que la materia exista y que la combinacion alumno+materia no este repetida
async function conflictoDeReferencias(alumno, materiaId, excluirId = null) {
  const [materias] = await db.execute("SELECT id FROM materias WHERE id = ?", [materiaId]);
  if (materias.length === 0) {
    return { estado: 404, mensaje: "Materia no encontrada" };
  }
  let sql =
    "SELECT id FROM calificaciones WHERE LOWER(TRIM(alumno)) = LOWER(TRIM(?)) AND materia_id = ?";
  const parametros = [alumno, materiaId];
  if (excluirId !== null) {
    sql += " AND id <> ?";
    parametros.push(excluirId);
  }
  const [repetidos] = await db.execute(sql, parametros);
  if (repetidos.length > 0) {
    return { estado: 409, mensaje: "Ya existe un registro para ese alumno y esa materia" };
  }
  return null;
}

// GET listado con filtros opcionales por materia y por alumno
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
    if (alumno !== undefined) {
      filtros.push("c.alumno LIKE ?");
      parametros.push(`%${alumno}%`);
    }
    let sql = SQL_BASE;
    if (filtros.length > 0) {
      sql += " WHERE " + filtros.join(" AND ");
    }
    const [calificaciones] = await db.execute(sql, parametros);
    res.send(calificaciones.map(representarCalificacion));
  },
);

// GET detalle de una calificacion
router.get("/:id", validarId, verificarValidaciones, async (req, res) => {
  const id = Number(req.params.id);
  const [calificaciones] = await db.execute(SQL_BASE + " WHERE c.id = ?", [id]);
  if (calificaciones.length === 0) {
    return res.status(404).send("Calificacion no encontrada");
  }
  res.send(representarCalificacion(calificaciones[0]));
});

// POST para crear una calificacion
router.post("/", validarCalificacionNueva, verificarValidaciones, async (req, res) => {
  const { alumno, materiaId, nota1, nota2, nota3 } = req.body;

  const conflicto = await conflictoDeReferencias(alumno, materiaId);
  if (conflicto) {
    return res.status(conflicto.estado).send(conflicto.mensaje);
  }

  const [result] = await db.execute(
    "INSERT INTO calificaciones (alumno, materia_id, nota1, nota2, nota3) VALUES (?,?,?,?,?)",
    [alumno.trim(), materiaId, nota1, nota2, nota3],
  );
  const [creadas] = await db.execute(SQL_BASE + " WHERE c.id = ?", [result.insertId]);
  res.status(201).send(representarCalificacion(creadas[0]));
});

// PUT para modificar una calificacion completa
router.put(
  "/:id",
  validarId,
  validarCalificacionCompleta,
  verificarValidaciones,
  async (req, res) => {
    const id = Number(req.params.id);

    const [existentes] = await db.execute("SELECT id FROM calificaciones WHERE id = ?", [id]);
    if (existentes.length === 0) {
      return res.status(404).send("Calificacion no encontrada");
    }

    const { alumno, materiaId, nota1, nota2, nota3 } = req.body;

    const conflicto = await conflictoDeReferencias(alumno, materiaId, id);
    if (conflicto) {
      return res.status(conflicto.estado).send(conflicto.mensaje);
    }

    await db.execute(
      "UPDATE calificaciones SET alumno = ?, materia_id = ?, nota1 = ?, nota2 = ?, nota3 = ? WHERE id = ?",
      [alumno.trim(), materiaId, nota1, nota2, nota3, id],
    );
    const [actualizadas] = await db.execute(SQL_BASE + " WHERE c.id = ?", [id]);
    res.send(representarCalificacion(actualizadas[0]));
  },
);

// DELETE para quitar una calificacion
router.delete("/:id", validarId, verificarValidaciones, async (req, res) => {
  const id = Number(req.params.id);
  const [existentes] = await db.execute(SQL_BASE + " WHERE c.id = ?", [id]);
  if (existentes.length === 0) {
    return res.status(404).send("Calificacion no encontrada");
  }
  await db.execute("DELETE FROM calificaciones WHERE id = ?", [id]);
  res.send(representarCalificacion(existentes[0]));
});

export default router;