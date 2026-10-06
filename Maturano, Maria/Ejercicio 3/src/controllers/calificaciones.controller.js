import { pool } from "../db.js";
import { MENSAJE_DUPLICADO } from "../middlewares/validar.js";

const SELECT_BASE = `
  SELECT c.id, c.alumno_id, a.nombre AS alumno, c.materia_id, m.nombre AS materia,
         c.nota1, c.nota2, c.nota3
  FROM calificaciones c
  JOIN alumnos a ON a.id = c.alumno_id
  JOIN materias m ON m.id = c.materia_id`;

const formatear = (fila) => ({
  id: fila.id,
  alumno: { id: fila.alumno_id, nombre: fila.alumno },
  materia: { id: fila.materia_id, nombre: fila.materia },
  notas: [fila.nota1, fila.nota2, fila.nota3],
});

const buscarPorId = async (id) => {
  const [filas] = await pool.query(SELECT_BASE + " WHERE c.id = ?", [id]);
  return filas[0];
};

const responderErrorBD = (error, res, next) => {
  if (error.code === "ER_DUP_ENTRY") {
    return res
      .status(409)
      .json({ errores: [{ campo: "materia_id", mensaje: MENSAJE_DUPLICADO }] });
  }
  if (error.code === "ER_NO_REFERENCED_ROW_2") {
    return res.status(404).json({ error: "El alumno o la materia no existe" });
  }
  next(error);
};

export const listar = async (req, res) => {
  const condiciones = [];
  const valores = [];
  if (req.query.alumno_id) {
    condiciones.push("c.alumno_id = ?");
    valores.push(req.query.alumno_id);
  }
  if (req.query.materia_id) {
    condiciones.push("c.materia_id = ?");
    valores.push(req.query.materia_id);
  }
  const where = condiciones.length ? " WHERE " + condiciones.join(" AND ") : "";
  const [filas] = await pool.query(
    SELECT_BASE + where + " ORDER BY a.nombre, m.nombre",
    valores
  );
  res.json(filas.map(formatear));
};

export const obtener = async (req, res) => {
  const fila = await buscarPorId(req.params.id);
  if (!fila) {
    return res.status(404).json({ error: "Calificación no encontrada" });
  }
  res.json(formatear(fila));
};

export const crear = async (req, res, next) => {
  try {
    const { alumno_id, materia_id, notas } = req.body;
    const [resultado] = await pool.query(
      "INSERT INTO calificaciones (alumno_id, materia_id, nota1, nota2, nota3) VALUES (?, ?, ?, ?, ?)",
      [alumno_id, materia_id, notas[0], notas[1], notas[2]]
    );
    const creada = await buscarPorId(resultado.insertId);
    res.status(201).json(formatear(creada));
  } catch (error) {
    responderErrorBD(error, res, next);
  }
};

export const modificar = async (req, res, next) => {
  try {
    const { alumno_id, materia_id, notas } = req.body;
    const [resultado] = await pool.query(
      "UPDATE calificaciones SET alumno_id = ?, materia_id = ?, nota1 = ?, nota2 = ?, nota3 = ? WHERE id = ?",
      [alumno_id, materia_id, notas[0], notas[1], notas[2], req.params.id]
    );
    if (resultado.affectedRows === 0) {
      return res.status(404).json({ error: "Calificación no encontrada" });
    }
    const modificada = await buscarPorId(req.params.id);
    res.json(formatear(modificada));
  } catch (error) {
    responderErrorBD(error, res, next);
  }
};

export const eliminar = async (req, res) => {
  const [resultado] = await pool.query(
    "DELETE FROM calificaciones WHERE id = ?",
    [req.params.id]
  );
  if (resultado.affectedRows === 0) {
    return res.status(404).json({ error: "Calificación no encontrada" });
  }
  res.status(204).send();
};