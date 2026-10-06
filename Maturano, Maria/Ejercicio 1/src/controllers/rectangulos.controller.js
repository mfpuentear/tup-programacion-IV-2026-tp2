import { pool } from "../db.js";

const redondear = (numero, decimales) => Number(numero.toFixed(decimales));

export const crear = async (req, res) => {
  const { lado_a, lado_b } = req.body;
  const perimetro = redondear(2 * (lado_a + lado_b), 2);
  const superficie = redondear(lado_a * lado_b, 4);

  const [resultado] = await pool.query(
    "INSERT INTO rectangulos (lado_a, lado_b, perimetro, superficie) VALUES (?, ?, ?, ?)",
    [lado_a, lado_b, perimetro, superficie]
  );

  res.status(201).json({ id: resultado.insertId, lado_a, lado_b, perimetro, superficie });
};

const COLUMNAS = "id, lado_a, lado_b, perimetro, superficie";

export const listar = async (req, res) => {
  const [filas] = await pool.query(
    `SELECT ${COLUMNAS} FROM rectangulos ORDER BY id`
  );
  res.json(filas);
};

export const obtener = async (req, res) => {
  const [filas] = await pool.query(
    `SELECT ${COLUMNAS} FROM rectangulos WHERE id = ?`,
    [req.params.id]
  );
  if (filas.length === 0) {
    return res.status(404).json({ error: "Rectángulo no encontrado" });
  }
  res.json(filas[0]);
};

export const modificar = async (req, res) => {
  const { lado_a, lado_b } = req.body;
  const perimetro = redondear(2 * (lado_a + lado_b), 2);
  const superficie = redondear(lado_a * lado_b, 4);

  const [resultado] = await pool.query(
    "UPDATE rectangulos SET lado_a = ?, lado_b = ?, perimetro = ?, superficie = ? WHERE id = ?",
    [lado_a, lado_b, perimetro, superficie, req.params.id]
  );

  if (resultado.affectedRows === 0) {
    return res.status(404).json({ error: "Rectángulo no encontrado" });
  }

  res.json({ id: Number(req.params.id), lado_a, lado_b, perimetro, superficie });
};

export const eliminar = async (req, res) => {
  const [resultado] = await pool.query(
    "DELETE FROM rectangulos WHERE id = ?",
    [req.params.id]
  );

  if (resultado.affectedRows === 0) {
    return res.status(404).json({ error: "Rectángulo no encontrado" });
  }

  res.status(204).send();
};