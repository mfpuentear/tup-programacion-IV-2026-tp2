import express from "express";
import { db } from "./db.js";
import {
  validarFiltrosRectangulos,
  validarId,
  validarRectangulo,
  verificarValidaciones,
} from "./validaciones.js";

const router = express.Router();

// listar rectangulos
router.get(
  "/",
  validarFiltrosRectangulos,
  verificarValidaciones,
  async (req, res) => {
    try {
      const filtros = [];
      const parametros = [];

      const { superficieMin, superficieMax, limit, offset } = req.query;

      if (superficieMin !== undefined) {
        filtros.push("superficie >= ?");
        parametros.push(Number(superficieMin));
      }

      if (superficieMax !== undefined) {
        filtros.push("superficie <= ?");
        parametros.push(Number(superficieMax));
      }

      let sql = "SELECT id, ladoA, ladoB, perimetro, superficie FROM ejercicio1";

      if (filtros.length > 0) {
        sql += " WHERE " + filtros.join(" AND ");
      }

      sql += " ORDER BY id ASC";

      if (limit !== undefined) {
        sql += " LIMIT ?";
        parametros.push(Number(limit));

        if (offset !== undefined) {
          sql += " OFFSET ?";
          parametros.push(Number(offset));
        }
      }

      const [rectangulos] = await db.execute(sql, parametros);
      res.send(rectangulos);
    } catch (error) {
      console.error(error.message);
      res.status(500).send({ error: error.message });
    }
  },
);

// obtener rectangulo por id
router.get("/:id", validarId, verificarValidaciones, async (req, res) => {
  try {
    const id = Number(req.params.id);

    const sql = "SELECT id, ladoA, ladoB, perimetro, superficie FROM ejercicio1 WHERE id = ?";
    const [rectangulos] = await db.execute(sql, [id]);

    if (rectangulos.length === 0) {
      return res.status(404).send("Rectángulo no encontrado");
    }

    res.send(rectangulos[0]);
  } catch (error) {
    console.error(error.message);
    res.status(500).send({ error: error.message });
  }
});

// crear rectangulo
router.post("/", validarRectangulo, verificarValidaciones, async (req, res) => {
  try {
    // saco lados del body
    const ladoA = Number(req.body.ladoA);
    const ladoB = Number(req.body.ladoB);

    // calculo perimetro y superficie en el servidor
    const perimetro = Number((2 * (ladoA + ladoB)).toFixed(2));
    const superficie = Number((ladoA * ladoB).toFixed(2));

    const [result] = await db.execute(
      "INSERT INTO ejercicio1 (ladoA, ladoB, perimetro, superficie) VALUES (?, ?, ?, ?)",
      [ladoA, ladoB, perimetro, superficie],
    );

    res.status(201).send({
      id: result.insertId,
      ladoA,
      ladoB,
      perimetro,
      superficie,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send({ error: error.message });
  }
});

// modificar rectangulo
router.put(
  "/:id",
  validarId,
  validarRectangulo,
  verificarValidaciones,
  async (req, res) => {
    try {
      const id = Number(req.params.id);
      const ladoA = Number(req.body.ladoA);
      const ladoB = Number(req.body.ladoB);

      // me fijo si existe el rectangulo
      const [existente] = await db.execute("SELECT id FROM ejercicio1 WHERE id = ?", [id]);
      if (existente.length === 0) {
        return res.status(404).send("Rectángulo no encontrado");
      }

      // calculo perimetro y superficie de vuelta
      const perimetro = Number((2 * (ladoA + ladoB)).toFixed(2));
      const superficie = Number((ladoA * ladoB).toFixed(2));

      await db.execute(
        "UPDATE ejercicio1 SET ladoA = ?, ladoB = ?, perimetro = ?, superficie = ? WHERE id = ?",
        [ladoA, ladoB, perimetro, superficie, id],
      );

      res.send({ id, ladoA, ladoB, perimetro, superficie });
    } catch (error) {
      console.error(error.message);
      res.status(500).send({ error: error.message });
    }
  },
);

// eliminar rectangulo
router.delete("/:id", validarId, verificarValidaciones, async (req, res) => {
  try {
    const id = Number(req.params.id);

    const [result] = await db.execute("DELETE FROM ejercicio1 WHERE id = ?", [id]);

    if (result.affectedRows === 0) {
      return res.status(404).send("Rectángulo no encontrado");
    }

    res.status(204).send();
  } catch (error) {
    console.error(error.message);
    res.status(500).send({ error: error.message });
  }
});

export default router;
