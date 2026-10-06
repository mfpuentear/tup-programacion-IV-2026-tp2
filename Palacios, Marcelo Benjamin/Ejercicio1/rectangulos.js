import express from "express";
import { db } from "./db.js";
import {
  validarFiltrosRectangulos,
  validarId,
  validarRectangulo,
  verificarValidaciones,
} from "./validaciones.js";

const router = express.Router();

// Calcula perimetro y superficie a partir de los lados
function calcularRectangulo(base, altura) {
  const perimetro = Number((2 * (base + altura)).toFixed(2));
  const superficie = Number((base * altura).toFixed(4));
  return { base, altura, perimetro, superficie };
}

// GET para entregar listado de rectangulos
router.get(
  "/",
  validarFiltrosRectangulos,
  verificarValidaciones,
  async (req, res) => {
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
  },
);

// GET para entregar detalle de rectangulo
router.get("/:id", validarId, verificarValidaciones, async (req, res) => {
  // Obtengo id
  const id = Number(req.params.id);

  const [rectangulos] = await db.execute(
    "SELECT * FROM rectangulos WHERE id=?",
    [id],
  );

  if (rectangulos.length === 0) {
    return res.status(404).send("Rectangulo no encontrado");
  }

  res.send(rectangulos[0]);
});

// POST para crear rectangulo
router.post("/", validarRectangulo, verificarValidaciones, async (req, res) => {
  // Obtengo los lados del body (el resto se calcula en el servidor)
  const base = Number(req.body.base);
  const altura = Number(req.body.altura);

  const rectangulo = calcularRectangulo(base, altura);

  const [result] = await db.execute(
    "INSERT INTO rectangulos (base, altura, perimetro, superficie) VALUES (?,?,?,?)",
    [rectangulo.base, rectangulo.altura, rectangulo.perimetro, rectangulo.superficie],
  );

  res.status(201).send({ id: result.insertId, ...rectangulo });
});

// PUT para modificar rectangulo a partir de un id
router.put(
  "/:id",
  validarId,
  validarRectangulo,
  verificarValidaciones,
  async (req, res) => {
    // Obtengo id
    const id = Number(req.params.id);

    // Verificar que este presente el rectangulo
    const [rectangulos] = await db.execute(
      "SELECT * FROM rectangulos WHERE id=?",
      [id],
    );

    if (rectangulos.length === 0) {
      return res.status(404).send("Rectangulo no encontrado");
    }

    // Obtengo los lados y recalculo perimetro y superficie
    const base = Number(req.body.base);
    const altura = Number(req.body.altura);

    const rectangulo = calcularRectangulo(base, altura);

    await db.execute(
      "UPDATE rectangulos SET base=?, altura=?, perimetro=?, superficie=? WHERE id=?",
      [rectangulo.base, rectangulo.altura, rectangulo.perimetro, rectangulo.superficie, id],
    );

    // Responder con rectangulo modificado
    res.send({ id, ...rectangulo });
  },
);

// DELETE para quitar un rectangulo a partir de un id
router.delete("/:id", validarId, verificarValidaciones, async (req, res) => {
  // Obtengo id
  const id = Number(req.params.id);

  // Verificar que este presente el rectangulo
  const [rectangulos] = await db.execute(
    "SELECT * FROM rectangulos WHERE id=?",
    [id],
  );

  if (rectangulos.length === 0) {
    return res.status(404).send("Rectangulo no encontrado");
  }

  await db.execute("DELETE FROM rectangulos WHERE id=?", [id]);

  // Retornar rectangulo quitado
  res.send(rectangulos[0]);
});

export default router;
