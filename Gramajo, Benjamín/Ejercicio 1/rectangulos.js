import express from "express";
import { db } from "./db.js";
import {
  validarId,
  validarRectangulo,
  verificarValidaciones,
} from "./validaciones.js";

const router = express.Router();

// GET para entregar listado de rectangulos
router.get("/", async (req, res) => {
  const [rectangulos] = await db.execute(
    "SELECT * FROM rectangulos ORDER BY id ASC",
  );
  res.send(rectangulos);
});

// GET para entregar detalle de rectangulo
router.get("/:id", validarId, verificarValidaciones, async (req, res) => {
  // Obtengo id
  const id = Number(req.params.id);

  const [rectangulos] = await db.execute(
    "SELECT * FROM rectangulos WHERE id = ?",
    [id],
  );

  if (rectangulos.length === 0) {
    return res.status(404).send("Rectángulo no encontrado");
  }

  res.send(rectangulos[0]);
});

// POST para crear rectangulo
router.post("/", validarRectangulo, verificarValidaciones, async (req, res) => {
  // Obtengo body
  const lado1 = Number(req.body.lado1);
  const lado2 = Number(req.body.lado2);

  // Perimetro y superficie se calculan en el servidor, nunca se reciben del cliente
  const perimetro = 2 * (lado1 + lado2);
  const superficie = lado1 * lado2;

  const [result] = await db.execute(
    "INSERT INTO rectangulos (lado1, lado2, perimetro, superficie) VALUES (?,?,?,?)",
    [lado1, lado2, perimetro, superficie],
  );

  res
    .status(201)
    .send({ id: result.insertId, lado1, lado2, perimetro, superficie });
});

// PUT para actualizar rectangulo
router.put(
  "/:id",
  validarId,
  validarRectangulo,
  verificarValidaciones,
  async (req, res) => {
    // Obtengo id y body
    const id = Number(req.params.id);
    const lado1 = Number(req.body.lado1);
    const lado2 = Number(req.body.lado2);

    // Perimetro y superficie se recalculan en el servidor
    const perimetro = 2 * (lado1 + lado2);
    const superficie = lado1 * lado2;

    const [result] = await db.execute(
      "UPDATE rectangulos SET lado1 = ?, lado2 = ?, perimetro = ?, superficie = ? WHERE id = ?",
      [lado1, lado2, perimetro, superficie, id],
    );

    if (result.affectedRows === 0) {
      return res.status(404).send("Rectángulo no encontrado");
    }

    res.send({ id, lado1, lado2, perimetro, superficie });
  },
);

// DELETE para eliminar rectangulo
router.delete("/:id", validarId, verificarValidaciones, async (req, res) => {
  // Obtengo id
  const id = Number(req.params.id);

  const [result] = await db.execute("DELETE FROM rectangulos WHERE id = ?", [
    id,
  ]);

  if (result.affectedRows === 0) {
    return res.status(404).send("Rectángulo no encontrado");
  }

  res.send({ mensaje: "Rectángulo eliminado" });
});

export default router;
