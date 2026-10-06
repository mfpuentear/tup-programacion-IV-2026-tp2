import { pool } from "../db.js";
import { MENSAJE_DUPLICADO } from "../validators/tareas.validators.js";

export const crear = async (req, res) => {
  const { nombre } = req.body;
  const completada = req.body.completada ?? false;

  try {
    const [resultado] = await pool.query(
      "INSERT INTO tareas (nombre, completada) VALUES (?, ?)",
      [nombre, completada]
    );
    res.status(201).json({ id: resultado.insertId, nombre, completada });
  } catch (error) {
    // Respaldo: si dos pedidos llegan a la vez, el índice UNIQUE de la base lo frena.
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ error: MENSAJE_DUPLICADO });
    }
    throw error;
  }
};
// MySQL guarda el booleano como 0/1: se convierte a true/false para la respuesta.
const aTarea = (fila) => ({
  id: fila.id,
  nombre: fila.nombre,
  completada: Boolean(fila.completada),
});

export const listar = async (req, res) => {
  const { estado } = req.query;
  let sql = "SELECT id, nombre, completada FROM tareas";
  const parametros = [];

  if (estado) {
    sql += " WHERE completada = ?";
    parametros.push(estado === "completadas");
  }

  const [filas] = await pool.query(`${sql} ORDER BY id`, parametros);
  res.json(filas.map(aTarea));
};

export const obtener = async (req, res) => {
  const [filas] = await pool.query(
    "SELECT id, nombre, completada FROM tareas WHERE id = ?",
    [req.params.id]
  );
  if (filas.length === 0) {
    return res.status(404).json({ error: "Tarea no encontrada" });
  }
  res.json(aTarea(filas[0]));
};

export const modificar = async (req, res) => {
  const { nombre, completada } = req.body;

  try {
    const [resultado] = await pool.query(
      "UPDATE tareas SET nombre = ?, completada = ? WHERE id = ?",
      [nombre, completada, req.params.id]
    );

    if (resultado.affectedRows === 0) {
      return res.status(404).json({ error: "Tarea no encontrada" });
    }

    res.json({ id: Number(req.params.id), nombre, completada });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ error: MENSAJE_DUPLICADO });
    }
    throw error;
  }
};

export const eliminar = async (req, res) => {
  const [resultado] = await pool.query(
    "DELETE FROM tareas WHERE id = ?",
    [req.params.id]
  );

  if (resultado.affectedRows === 0) {
    return res.status(404).json({ error: "Tarea no encontrada" });
  }

  res.status(204).send();
};