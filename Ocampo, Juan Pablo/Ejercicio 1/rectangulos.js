import express from "express";
import { db } from "./db.js";
import { validarRectangulo, validarId, verificarValidaciones } from "./validaciones.js";

const router = express.Router();

// GET listar rectangulos
router.get("/", async (req, res) => {
  const [rows] = await db.execute("SELECT * FROM rectangulos");
  res.send(rows);
});

// GET detalle del rectangulo
router.get("/:id", validarId, verificarValidaciones, async (req, res) => {
  const id = Number(req.params.id);
  const [rows] = await db.execute("SELECT * FROM rectangulos WHERE id=?", [id]);

  if (rows.length === 0) {
    return res.status(404).send("Rectangulo no encontrado");
  }
  res.send(rows[0]);
});

// POST crear rectangulo
router.post("/", validarRectangulo, verificarValidaciones, async (req, res) => {
  const { ladoA, ladoB } = req.body;
  const perimetro = 2 * (ladoA + ladoB);
  const superficie = ladoA * ladoB;

  const [result] = await db.execute(
    "INSERT INTO rectangulos (ladoA, ladoB, perimetro, superficie) VALUES (?,?,?,?)",
    [ladoA, ladoB, perimetro, superficie]
  );

  res.status(201).send({ id: result.insertId, ladoA, ladoB, perimetro, superficie });
});

// PUT modificar rectangulo
router.put("/:id", [validarId, ...validarRectangulo], verificarValidaciones, async (req, res) => {
  const id = Number(req.params.id);
  const { ladoA, ladoB } = req.body;
  const perimetro = 2 * (ladoA + ladoB);
  const superficie = ladoA * ladoB;

  const [result] = await db.execute(
    "UPDATE rectangulos SET ladoA=?, ladoB=?, perimetro=?, superficie=? WHERE id=?",
    [ladoA, ladoB, perimetro, superficie, id]
  );

  if (result.affectedRows === 0) {
    return res.status(404).send("Rectangulo no encontrado");
  }

  res.send({ id, ladoA, ladoB, perimetro, superficie });
});

// DELETE eliminar rectangulo
router.delete("/:id", validarId, verificarValidaciones, async (req, res) => {
  const id = Number(req.params.id);
  const [result] = await db.execute("DELETE FROM rectangulos WHERE id=?", [id]);

  if (result.affectedRows === 0) {
    return res.status(404).send("Rectangulo no encontrado");
  }

  res.send({ mensaje: "Rectangulo eliminado", id });
});

export default router;
