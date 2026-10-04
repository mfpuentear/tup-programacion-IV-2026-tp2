import express from "express";
import { db } from "./db.js";
import {
  validarFiltros,
  validarId,
  validarRectangulo,
  verificarValidaciones,
} from "./validaciones.js";

const router = express.Router();

// Calcula perímetro y superficie en el servidor
function calcular(lado1, lado2) {
  return {
    perimetro: 2 * (lado1 + lado2),
    superficie: lado1 * lado2,
  };
}

// GET para entregar listado de rectangulos (con filtros opcionales)
router.get("/", validarFiltros, verificarValidaciones, async (req, res) => {
  const filtros = [];
  const parametros = [];

  const { superficieMin, superficieMax } = req.query;

  if (superficieMin !== undefined) {
    filtros.push("superficie >= ?");
    parametros.push(Number(superficieMin));
  }

  if (superficieMax !== undefined) {
    filtros.push("superficie <= ?");
    parametros.push(Number(superficieMax));
  }

  let sql = "SELECT * FROM rectangulos";

  if (filtros.length > 0) {
    sql += " WHERE " + filtros.join(" AND ");
  }

  const [rectangulos] = await db.execute(sql, parametros);
  res.send(rectangulos);
});

// GET para entregar un rectangulo
router.get("/:id", validarId, verificarValidaciones, async (req, res) => {
  const id = Number(req.params.id);

  const [rectangulos] = await db.execute(
    "SELECT * FROM rectangulos WHERE id = ?",
    [id],
  );

  if (rectangulos.length === 0) {
    return res.status(404).send({ mensaje: "Rectángulo no encontrado" });
  }

  res.send(rectangulos[0]);
});

// POST para crear rectangulo
router.post("/", validarRectangulo, verificarValidaciones, async (req, res) => {
  const lado1 = Number(req.body.lado1);
  const lado2 = Number(req.body.lado2);
  const { perimetro, superficie } = calcular(lado1, lado2);

  const [result] = await db.execute(
    "INSERT INTO rectangulos (lado1, lado2, perimetro, superficie) VALUES (?,?,?,?)",
    [lado1, lado2, perimetro, superficie],
  );

  res.status(201).send({ id: result.insertId, lado1, lado2, perimetro, superficie });
});

// PUT para modificar rectangulo
router.put(
  "/:id",
  validarId,
  validarRectangulo,
  verificarValidaciones,
  async (req, res) => {
    const id = Number(req.params.id);
    const lado1 = Number(req.body.lado1);
    const lado2 = Number(req.body.lado2);
    const { perimetro, superficie } = calcular(lado1, lado2);

    const [result] = await db.execute(
      "UPDATE rectangulos SET lado1 = ?, lado2 = ?, perimetro = ?, superficie = ? WHERE id = ?",
      [lado1, lado2, perimetro, superficie, id],
    );

    if (result.affectedRows === 0) {
      return res.status(404).send({ mensaje: "Rectángulo no encontrado" });
    }

    res.send({ id, lado1, lado2, perimetro, superficie });
  },
);

// DELETE para eliminar rectangulo
router.delete("/:id", validarId, verificarValidaciones, async (req, res) => {
  const id = Number(req.params.id);

  const [result] = await db.execute("DELETE FROM rectangulos WHERE id = ?", [
    id,
  ]);

  if (result.affectedRows === 0) {
    return res.status(404).send({ mensaje: "Rectángulo no encontrado" });
  }

  res.status(204).send();
});

export default router;