import express from "express";
import { db } from "./db.js";
import { validarNota, validarId, verificarValidaciones } from "./validaciones.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const [notas] = await db.execute(`
    SELECT n.id, a.nombre AS alumno, m.nombre AS materia, n.nota1, n.nota2, n.nota3
    FROM notas n
    JOIN alumnos a ON n.alumno_id = a.id
    JOIN materias m ON n.materia_id = m.id
  `);
  res.send(notas);
});

router.get("/:id", validarId, verificarValidaciones, async (req, res) => {
  const [nota] = await db.execute(`
    SELECT n.id, a.nombre AS alumno, m.nombre AS materia, n.nota1, n.nota2, n.nota3
    FROM notas n
    JOIN alumnos a ON n.alumno_id = a.id
    JOIN materias m ON n.materia_id = m.id
    WHERE n.id=?
  `, [req.params.id]);
  if (nota.length === 0) {
    return res.status(404).send("nota no encontrada");
  }
  res.send(nota[0]);
});

router.post("/", validarNota, verificarValidaciones, async (req, res) => {
  const { alumno_id, materia_id, nota1, nota2, nota3 } = req.body;

  // Verificar que el alumno exista
const [alumno] = await db.execute("SELECT * FROM alumnos WHERE id=?", [alumno_id]);
if (alumno.length === 0) {
  return res.status(400).send("El alumno no existe");
}

  // Verificar que la materia exista
  const [materia] = await db.execute("SELECT * FROM materias WHERE id=?", [materia_id]);
  if (materia.length === 0) {
    return res.status(400).send("La materia no existe");
  }

  
  const [existe] = await db.execute("SELECT * FROM notas WHERE alumno_id=? AND materia_id=?", [alumno_id, materia_id]);
  if (existe.length > 0) {
    return res.status(400).send("ya existe una nota para ese alumno en esa materia");
  }

  const [result] = await db.execute(
    "INSERT INTO notas (alumno_id, materia_id, nota1, nota2, nota3) VALUES (?,?,?,?,?)",
    [alumno_id, materia_id, nota1, nota2, nota3]
  );
  res.status(201).send({ id: result.insertId, alumno_id, materia_id, nota1, nota2, nota3 });
});

router.put("/:id", [validarId, ...validarNota], verificarValidaciones, async (req, res) => {
  const { alumno_id, materia_id, nota1, nota2, nota3 } = req.body;

  // verificar que el alumno exista
const [alumno] = await db.execute("SELECT * FROM alumnos WHERE id=?", [alumno_id]);
if (alumno.length === 0) {
  return res.status(400).send("El alumno no existe");
}

  // verificar que la materia exista
  const [materia] = await db.execute("SELECT * FROM materias WHERE id=?", [materia_id]);
  if (materia.length === 0) {
    return res.status(400).send("La materia no existe");
  }

  const [existe] = await db.execute(
    "SELECT * FROM notas WHERE alumno_id=? AND materia_id=? AND id<>?",
    [alumno_id, materia_id, req.params.id]
  );
  if (existe.length > 0) {
    return res.status(400).send("ya existe otra nota para ese alumno en esa materia");
  }

  const [result] = await db.execute(
    "UPDATE notas SET alumno_id=?, materia_id=?, nota1=?, nota2=?, nota3=? WHERE id=?",
    [alumno_id, materia_id, nota1, nota2, nota3, req.params.id]
  );
  if (result.affectedRows === 0) {
    return res.status(404).send("nota no encontrada");
  }

  res.send({ id: req.params.id, alumno_id, materia_id, nota1, nota2, nota3 });
});

router.delete("/:id", validarId, verificarValidaciones, async (req, res) => {
  const [result] = await db.execute("DELETE FROM notas WHERE id=?", [req.params.id]);
  if (result.affectedRows === 0) {
    return res.status(404).send("nota no encontrada");
  }
  res.send("nota eliminada");
});

export default router;
