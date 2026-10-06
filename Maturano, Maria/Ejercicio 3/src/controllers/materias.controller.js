import { pool } from "../db.js";
import { MENSAJE_DUPLICADO } from "../middlewares/validar.js";

export const listar = async (req, res) => {
  const [filas] = await pool.query(
    "SELECT id, nombre FROM materias ORDER BY nombre"
  );
  res.json(filas);
};

export const obtener = async (req, res) => {
  const [filas] = await pool.query(
    "SELECT id, nombre FROM materias WHERE id = ?",
    [req.params.id]
  );
  if (filas.length === 0) {
    return res.status(404).json({ error: "Materia no encontrada" });
  }
  res.json(filas[0]);
};

export const crear = async (req, res, next) => {
  try {
    const { nombre } = req.body;
    const [resultado] = await pool.query(
      "INSERT INTO materias (nombre) VALUES (?)",
      [nombre]
    );
    res.status(201).json({ id: resultado.insertId, nombre });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res
        .status(409)
        .json({ errores: [{ campo: "nombre", mensaje: MENSAJE_DUPLICADO }] });
    }
    next(error);
  }
};

export const modificar = async (req, res, next) => {
  try {
    const { nombre } = req.body;
    const [resultado] = await pool.query(
      "UPDATE materias SET nombre = ? WHERE id = ?",
      [nombre, req.params.id]
    );
    if (resultado.affectedRows === 0) {
      return res.status(404).json({ error: "Materia no encontrada" });
    }
    res.json({ id: Number(req.params.id), nombre });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res
        .status(409)
        .json({ errores: [{ campo: "nombre", mensaje: MENSAJE_DUPLICADO }] });
    }
    next(error);
  }
};

export const eliminar = async (req, res, next) => {
  try {
    const [resultado] = await pool.query("DELETE FROM materias WHERE id = ?", [
      req.params.id,
    ]);
    if (resultado.affectedRows === 0) {
      return res.status(404).json({ error: "Materia no encontrada" });
    }
    res.status(204).send();
  } catch (error) {
    if (error.code === "ER_ROW_IS_REFERENCED_2") {
      return res.status(409).json({
        error: "No se puede eliminar: la materia tiene calificaciones asociadas",
      });
    }
    next(error);
  }
};