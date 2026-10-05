import express from "express";
import { db } from "./db.js";
import {
  validarId,
  validarFiltrosRectangulos,
  validarLados,
  verificarValidaciones,
} from "./validaciones.js";

const router = express.Router();

function calcularMedidas(ladoA, ladoB) {
  const a = Number(ladoA);
  const b = Number(ladoB);
  return {
    ladoA: a,
    ladoB: b,
    perimetro: Number((2 * (a + b)).toFixed(2)),
    superficie: Number((a * b).toFixed(2)),
  };
}

function mapear(fila) {
  const ladoA = Number(fila.lado_a);
  const ladoB = Number(fila.lado_b);
  return {
    id: fila.id,
    ladoA,
    ladoB,
    perimetro: Number(fila.perimetro),
    superficie: Number(fila.superficie),
    esCuadrado: ladoA === ladoB,
  };
}

// GET listado, filtro opcional por esCuadrado
router.get("/", validarFiltrosRectangulos, verificarValidaciones, async (req, res) => {
  const [filas] = await db.execute(
    "SELECT id, lado_a, lado_b, perimetro, superficie FROM rectangulos",
  );
  let resultado = filas.map(mapear);

  if (req.query.esCuadrado === "true") {
    resultado = resultado.filter((r) => r.esCuadrado);
  }
  if (req.query.esCuadrado === "false") {
    resultado = resultado.filter((r) => !r.esCuadrado);
  }

  res.send(resultado);
});

// GET detalle
router.get("/:id", validarId, verificarValidaciones, async (req, res) => {
  const id = Number(req.params.id);
  const [filas] = await db.execute(
    "SELECT id, lado_a, lado_b, perimetro, superficie FROM rectangulos WHERE id = ?",
    [id],
  );

  if (filas.length === 0) {
    return res.status(404).send("Rectángulo no encontrado");
  }

  res.send(mapear(filas[0]));
});

// POST crear: el cliente solo envia lados
router.post("/", validarLados, verificarValidaciones, async (req, res) => {
  const medidas = calcularMedidas(req.body.ladoA, req.body.ladoB);

  const [result] = await db.execute(
    "INSERT INTO rectangulos (lado_a, lado_b, perimetro, superficie) VALUES (?, ?, ?, ?)",
    [medidas.ladoA, medidas.ladoB, medidas.perimetro, medidas.superficie],
  );

  res.status(201).send({
    id: result.insertId,
    ...medidas,
    esCuadrado: medidas.ladoA === medidas.ladoB,
  });
});

// PUT modificar: se recalculan perimetro y superficie
router.put("/:id", validarId, validarLados, verificarValidaciones, async (req, res) => {
  const id = Number(req.params.id);
  const [existentes] = await db.execute("SELECT id FROM rectangulos WHERE id = ?", [id]);

  if (existentes.length === 0) {
    return res.status(404).send("Rectángulo no encontrado");
  }

  const medidas = calcularMedidas(req.body.ladoA, req.body.ladoB);

  await db.execute(
    "UPDATE rectangulos SET lado_a = ?, lado_b = ?, perimetro = ?, superficie = ? WHERE id = ?",
    [medidas.ladoA, medidas.ladoB, medidas.perimetro, medidas.superficie, id],
  );

  res.send({
    id,
    ...medidas,
    esCuadrado: medidas.ladoA === medidas.ladoB,
  });
});

// DELETE
router.delete("/:id", validarId, verificarValidaciones, async (req, res) => {
  const id = Number(req.params.id);
  const [filas] = await db.execute(
    "SELECT id, lado_a, lado_b, perimetro, superficie FROM rectangulos WHERE id = ?",
    [id],
  );

  if (filas.length === 0) {
    return res.status(404).send("Rectángulo no encontrado");
  }

  await db.execute("DELETE FROM rectangulos WHERE id = ?", [id]);
  res.send(mapear(filas[0]));
});

export default router;
