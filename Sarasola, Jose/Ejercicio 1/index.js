const express = require("express");
const pool = require("./db");
const {
  soloCamposBody,
  soloQuery,
  validarId,
  validarRectangulo,
  validarFiltroCuadrado,
} = require("./validators");
require("dotenv").config();

const app = express();
const PORT = Number(process.env.PORT || 3001);

app.use(express.json());

function calcularDatos(lado1, lado2) {
  return {
    perimetro: 2 * (lado1 + lado2),
    superficie: lado1 * lado2,
  };
}

app.get(
  "/rectangulos",
  soloQuery(["cuadrado"]),
  validarFiltroCuadrado,
  async (req, res, next) => {
    try {
      let sql = "SELECT id, lado1, lado2, perimetro, superficie FROM rectangulos";
      const params = [];

      if (req.query.cuadrado === "true") {
        sql += " WHERE lado1 = lado2";
      } else if (req.query.cuadrado === "false") {
        sql += " WHERE lado1 <> lado2";
      }

      sql += " ORDER BY id";

      const [filas] = await pool.execute(sql, params);
      return res.status(200).json(filas);
    } catch (error) {
      next(error);
    }
  }
);

app.get("/rectangulos/:id", validarId, async (req, res, next) => {
  try {
    const [filas] = await pool.execute(
      "SELECT id, lado1, lado2, perimetro, superficie FROM rectangulos WHERE id = ?",
      [req.params.id]
    );

    if (filas.length === 0) {
      return res.status(404).json({ error: "Rectángulo no encontrado." });
    }

    return res.status(200).json(filas[0]);
  } catch (error) {
    next(error);
  }
});

app.post(
  "/rectangulos",
  soloCamposBody(["lado1", "lado2"]),
  validarRectangulo,
  async (req, res, next) => {
    try {
      const { lado1, lado2 } = req.body;
      const { perimetro, superficie } = calcularDatos(lado1, lado2);

      const [resultado] = await pool.execute(
        `INSERT INTO rectangulos (lado1, lado2, perimetro, superficie)
         VALUES (?, ?, ?, ?)`,
        [lado1, lado2, perimetro, superficie]
      );

      return res.status(201).json({
        id: resultado.insertId,
        lado1,
        lado2,
        perimetro,
        superficie,
      });
    } catch (error) {
      next(error);
    }
  }
);

app.put(
  "/rectangulos/:id",
  validarId,
  soloCamposBody(["lado1", "lado2"]),
  validarRectangulo,
  async (req, res, next) => {
    try {
      const { lado1, lado2 } = req.body;
      const { perimetro, superficie } = calcularDatos(lado1, lado2);

      const [resultado] = await pool.execute(
        `UPDATE rectangulos
         SET lado1 = ?, lado2 = ?, perimetro = ?, superficie = ?
         WHERE id = ?`,
        [lado1, lado2, perimetro, superficie, req.params.id]
      );

      if (resultado.affectedRows === 0) {
        return res.status(404).json({ error: "Rectángulo no encontrado." });
      }

      return res.status(200).json({
        id: req.params.id,
        lado1,
        lado2,
        perimetro,
        superficie,
      });
    } catch (error) {
      next(error);
    }
  }
);

app.delete("/rectangulos/:id", validarId, async (req, res, next) => {
  try {
    const [resultado] = await pool.execute(
      "DELETE FROM rectangulos WHERE id = ?",
      [req.params.id]
    );

    if (resultado.affectedRows === 0) {
      return res.status(404).json({ error: "Rectángulo no encontrado." });
    }

    return res.status(204).send();
  } catch (error) {
    next(error);
  }
});

app.use((req, res) => {
  return res.status(404).json({ error: "Recurso no encontrado." });
});

app.use((error, req, res, next) => {
  if (error instanceof SyntaxError && error.status === 400 && "body" in error) {
    return res.status(400).json({ error: "El cuerpo JSON no es válido." });
  }

  console.error(error);
  return res.status(500).json({ error: "Error interno del servidor." });
});

app.listen(PORT, async () => {
  try {
    await pool.query("SELECT 1");
    console.log(`Ejercicio 1 ejecutándose en http://localhost:${PORT}`);
    console.log("Conexión con MySQL correcta.");
  } catch (error) {
    console.error("No se pudo conectar con MySQL:", error.message);
  }
});
