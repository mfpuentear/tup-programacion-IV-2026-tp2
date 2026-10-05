const express = require("express");
const { body, param, validationResult } = require("express-validator");
const conexion = require("./db");

const app = express();

app.use(express.json());

app.get("/rectangulos", (req, res) => {
  conexion.query("SELECT * FROM rectangulos", (error, resultados) => {
    if (error) {
      return res.status(500).json({
        error: "Error al obtener los rectangulos",
      });
    }

    res.json(resultados);
  });
});

app.get(
  "/rectangulos/:id",

  param("id")
    .isInt({ min: 1 })
    .withMessage("El ID debe ser un numero entero mayor que 0"),

  (req, res) => {
    const errores = validationResult(req);

    if (!errores.isEmpty()) {
      return res.status(400).json({
        errores: errores.array(),
      });
    }

    conexion.query(
      "SELECT * FROM rectangulos WHERE id = ?",
      [req.params.id],
      (error, resultados) => {
        if (error) {
          return res.status(500).json({
            error: "Error al buscar el rectangulo",
          });
        }

        if (resultados.length === 0) {
          return res.status(404).json({
            error: "Rectangulo no encontrado",
          });
        }

        res.json(resultados[0]);
      },
    );
  },
);

app.post(
  "/rectangulos",

  body("lado_a")
    .isFloat({ gt: 0 })
    .withMessage("lado_a debe ser un numero mayor que 0"),

  body("lado_b")
    .isFloat({ gt: 0 })
    .withMessage("lado_b debe ser un numero mayor que 0"),

  (req, res) => {
    const errores = validationResult(req);

    if (!errores.isEmpty()) {
      return res.status(400).json({
        errores: errores.array(),
      });
    }

    const { lado_a, lado_b } = req.body;

    const perimetro = 2 * (Number(lado_a) + Number(lado_b));
    const superficie = Number(lado_a) * Number(lado_b);

    conexion.query(
      `INSERT INTO rectangulos
            (lado_a, lado_b, perimetro, superficie)
            VALUES (?, ?, ?, ?)`,
      [lado_a, lado_b, perimetro, superficie],
      (error, resultado) => {
        if (error) {
          return res.status(500).json({
            error: "Error al crear el rectangulo",
          });
        }

        res.status(201).json({
          id: resultado.insertId,
          lado_a,
          lado_b,
          perimetro,
          superficie,
        });
      },
    );
  },
);

app.put(
  "/rectangulos/:id",

  param("id")
    .isInt({ min: 1 })
    .withMessage("El ID debe ser un numero entero mayor que 0"),

  body("lado_a")
    .isFloat({ gt: 0 })
    .withMessage("lado_a debe ser un numero mayor que 0"),

  body("lado_b")
    .isFloat({ gt: 0 })
    .withMessage("lado_b debe ser un numero mayor que 0"),

  (req, res) => {
    const errores = validationResult(req);

    if (!errores.isEmpty()) {
      return res.status(400).json({
        errores: errores.array(),
      });
    }

    const { lado_a, lado_b } = req.body;

    const perimetro = 2 * (Number(lado_a) + Number(lado_b));
    const superficie = Number(lado_a) * Number(lado_b);

    conexion.query(
      `UPDATE rectangulos
            SET lado_a = ?, lado_b = ?, perimetro = ?, superficie = ?
            WHERE id = ?`,
      [lado_a, lado_b, perimetro, superficie, req.params.id],
      (error, resultado) => {
        if (error) {
          return res.status(500).json({
            error: "Error al modificar el rectangulo",
          });
        }

        if (resultado.affectedRows === 0) {
          return res.status(404).json({
            error: "Rectangulo no encontrado",
          });
        }

        res.json({
          mensaje: "Rectangulo modificado correctamente",
        });
      },
    );
  },
);

app.delete(
  "/rectangulos/:id",

  param("id")
    .isInt({ min: 1 })
    .withMessage("El ID debe ser un numero entero mayor que 0"),

  (req, res) => {
    const errores = validationResult(req);

    if (!errores.isEmpty()) {
      return res.status(400).json({
        errores: errores.array(),
      });
    }

    conexion.query(
      "DELETE FROM rectangulos WHERE id = ?",
      [req.params.id],
      (error, resultado) => {
        if (error) {
          return res.status(500).json({
            error: "Error al eliminar el rectangulo",
          });
        }

        if (resultado.affectedRows === 0) {
          return res.status(404).json({
            error: "Rectangulo no encontrado",
          });
        }

        res.json({
          mensaje: "Rectangulo eliminado correctamente",
        });
      },
    );
  },
);

app.listen(3000, () => {
  console.log("Servidor funcionando en http://localhost:3000");
});
