import express from "express";
import { db } from "./db.js";
import { validarNombreAlumno, verificarValidaciones } from "./validaciones.js";

const router = express.Router();

// Los alumnos no tienen tabla propia: se obtienen a partir de las calificaciones

// GET para entregar listado de alumnos
router.get("/", async (req, res) => {
  const [alumnos] = await db.execute(
    "SELECT alumno AS nombre, COUNT(*) AS materias FROM calificaciones GROUP BY alumno",
  );
  res.send(alumnos);
});

// GET para entregar las calificaciones de un alumno
router.get(
  "/:nombre/calificaciones",
  validarNombreAlumno,
  verificarValidaciones,
  async (req, res) => {
    const nombre = req.params.nombre;

    let sql =
      "SELECT c.id, c.alumno, m.nombre AS materia, c.nota1, c.nota2, c.nota3 " +
      "FROM calificaciones c " +
      "JOIN materias m ON c.materia_id = m.id " +
      "WHERE c.alumno = ?";

    const [calificaciones] = await db.execute(sql, [nombre]);

    if (calificaciones.length === 0) {
      return res.status(404).send("Alumno no encontrado");
    }

    res.send(calificaciones);
  },
);

export default router;