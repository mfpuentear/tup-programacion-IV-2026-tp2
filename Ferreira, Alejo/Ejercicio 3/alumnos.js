import express from "express";
import { db } from "./db.js";
import { validarFiltrosAlumnos, verificarValidaciones } from "./validaciones.js";

const router = express.Router();

// Clave para agrupar alumnos: ignora mayúsculas y tildes
// (el mismo criterio que usa la base con la collation ai_ci)
function claveAlumno(nombre) {
  return nombre
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

// GET para entregar listado de alumnos con sus calificaciones
router.get("/", validarFiltrosAlumnos, verificarValidaciones, async (req, res) => {
  const { nombre } = req.query;

  let sql =
    "SELECT c.id, c.alumno, m.id AS materia_id, m.nombre AS materia, c.nota1, c.nota2, c.nota3 " +
    "FROM calificaciones c " +
    "JOIN materias m ON c.materia_id = m.id";
  const parametros = [];

  if (nombre !== undefined) {
    sql += " WHERE c.alumno LIKE ?";
    parametros.push(`%${nombre}%`);
  }

  sql += " ORDER BY c.alumno, m.nombre";

  const [filas] = await db.execute(sql, parametros);

  // Agrupa las calificaciones por alumno
  const alumnos = new Map();

  for (const fila of filas) {
    const clave = claveAlumno(fila.alumno);

    if (!alumnos.has(clave)) {
      alumnos.set(clave, { alumno: fila.alumno, calificaciones: [] });
    }

    alumnos.get(clave).calificaciones.push({
      id: fila.id,
      materia: { id: fila.materia_id, nombre: fila.materia },
      notas: [fila.nota1, fila.nota2, fila.nota3],
    });
  }

  res.send([...alumnos.values()]);
});

export default router;