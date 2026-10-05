import express from "express";
import { db } from "./db.js";
import {
  validarFiltrosRectangulos,
  validarId,
  validarRectangulo,
  verificarValidaciones,
} from "./validaciones.js";

const router = express.Router();

// GET para entregar listado de rectangulos con filtros opcionales
router.get(
  "/",
  validarFiltrosRectangulos,
  verificarValidaciones,
  async (req, res) => {
    const filtros = [];
    const parametros = [];
    const { tipo, perimetroMin, perimetroMax } = req.query;

    if (tipo === "cuadrado") {
      filtros.push("lado_a = lado_b");
    }
    if (tipo === "rectangulo") {
      filtros.push("lado_a <> lado_b");
    }
    if (perimetroMin !== undefined) {
      filtros.push("perimetro >= ?");
      parametros.push(Number(perimetroMin));
    }
    if (perimetroMax !== undefined) {
      filtros.push("perimetro <= ?");
      parametros.push(Number(perimetroMax));
    }

    let sql =
      "SELECT id, lado_a AS ladoA, lado_b AS ladoB, perimetro, superficie " +
      "FROM rectangulos";
    if (filtros.length > 0) {
      sql += " WHERE " + filtros.join(" AND ");
    }

    const [rectangulos] = await db.execute(sql, parametros);
    res.send(rectangulos);
  },
);

// GET para entregar detalle de un rectangulo
router.get("/:id", validarId, verificarValidaciones, async (req, res) => {
  const id = Number(req.params.id);
  const [rectangulos] = await db.execute(
    "SELECT id, lado_a AS ladoA, lado_b AS ladoB, perimetro, superficie " +
      "FROM rectangulos WHERE id = ?",
    [id],
  );
  if (rectangulos.length === 0) {
    return res.status(404).send("Rectangulo no encontrado");
  }
  res.send(rectangulos[0]);
});

// POST para crear un rectangulo
router.post("/", validarRectangulo, verificarValidaciones, async (req, res) => {
  const { ladoA, ladoB } = req.body;

  // Calculo perimetro y superficie en el servidor antes de persistir
  const perimetro = 2 * (ladoA + ladoB);
  const superficie = ladoA * ladoB;

  const [result] = await db.execute(
    "INSERT INTO rectangulos (lado_a, lado_b, perimetro, superficie) VALUES (?,?,?,?)",
    [ladoA, ladoB, perimetro, superficie],
  );

  res.status(201).send({ id: result.insertId, ladoA, ladoB, perimetro, superficie });
});

// PUT para modificar un rectangulo a partir de un id
router.put(
  "/:id",
  validarId,
  validarRectangulo,
  verificarValidaciones,
  async (req, res) => {
    const id = Number(req.params.id);

    // Verificar que este presente el rectangulo
    const [existentes] = await db.execute(
      "SELECT id FROM rectangulos WHERE id = ?",
      [id],
    );
    if (existentes.length === 0) {
      return res.status(404).send("Rectangulo no encontrado");
    }

    const { ladoA, ladoB } = req.body;

    // Recalculo perimetro y superficie con los lados nuevos
    const perimetro = 2 * (ladoA + ladoB);
    const superficie = ladoA * ladoB;

    await db.execute(
      "UPDATE rectangulos SET lado_a = ?, lado_b = ?, perimetro = ?, superficie = ? WHERE id = ?",
      [ladoA, ladoB, perimetro, superficie, id],
    );

    res.send({ id, ladoA, ladoB, perimetro, superficie });
  },
);

// DELETE para quitar un rectangulo a partir de un id
router.delete("/:id", validarId, verificarValidaciones, async (req, res) => {
  const id = Number(req.params.id);

  // Verificar que este presente el rectangulo
  const [existentes] = await db.execute(
    "SELECT id, lado_a AS ladoA, lado_b AS ladoB, perimetro, superficie " +
      "FROM rectangulos WHERE id = ?",
    [id],
  );
  if (existentes.length === 0) {
    return res.status(404).send("Rectangulo no encontrado");
  }

  await db.execute("DELETE FROM rectangulos WHERE id = ?", [id]);

  res.send(existentes[0]);
});

export default router;