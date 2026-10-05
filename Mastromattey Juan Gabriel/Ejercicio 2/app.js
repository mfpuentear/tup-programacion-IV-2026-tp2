const express = require("express");
const { body, param, query, validationResult } = require("express-validator");

const conexion = require("./db");

const app = express();

app.use(express.json());

app.get("/tareas", (req, res) => {
  conexion.query("SELECT * FROM tareas", (error, resultados) => {
    if (error) {
      return res.status(500).json({
        error: "Error al obtener las tareas",
      });
    }

    res.json(resultados);
  });
});

app.get(
  "/tareas/filtrar",

  query("estado")
    .isIn(["completadas", "pendientes"])
    .withMessage("El estado debe ser 'completadas' o 'pendientes'"),

  (req, res) => {
    const errores = validationResult(req);

    if (!errores.isEmpty()) {
      return res.status(400).json({
        errores: errores.array(),
      });
    }

    let valorEstado;

    if (req.query.estado === "completadas") {
      valorEstado = true;
    } else {
      valorEstado = false;
    }

    conexion.query(
      "SELECT * FROM tareas WHERE completada = ?",
      [valorEstado],
      (error, resultados) => {
        if (error) {
          return res.status(500).json({
            error: "Error al filtrar las tareas",
          });
        }

        res.json(resultados);
      },
    );
  },
);

app.get(
  "/tareas/:id",

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
      "SELECT * FROM tareas WHERE id = ?",
      [req.params.id],
      (error, resultados) => {
        if (error) {
          return res.status(500).json({
            error: "Error al buscar la tarea",
          });
        }

        if (resultados.length === 0) {
          return res.status(404).json({
            error: "Tarea no encontrada",
          });
        }

        res.json(resultados[0]);
      },
    );
  },
);

app.post(
  "/tareas",

  body("nombre")
    .exists()
    .withMessage("El nombre es obligatorio")
    .isString()
    .withMessage("El nombre debe ser texto")
    .trim()
    .notEmpty()
    .withMessage("El nombre no puede estar vacio")
    .isLength({ max: 255 })
    .withMessage("El nombre no puede superar los 255 caracteres"),

  body("completada")
    .exists()
    .withMessage("El estado completada es obligatorio")
    .isBoolean()
    .withMessage("El estado debe ser booleano"),

  (req, res) => {
    const errores = validationResult(req);

    if (!errores.isEmpty()) {
      return res.status(400).json({
        errores: errores.array(),
      });
    }

    const nombre = req.body.nombre.trim();
    const completada = req.body.completada;

    conexion.query(
      "SELECT * FROM tareas WHERE nombre = ?",
      [nombre],
      (error, resultados) => {
        if (error) {
          return res.status(500).json({
            error: "Error al verificar la tarea",
          });
        }

        if (resultados.length > 0) {
          return res.status(409).json({
            error: "Ya existe una tarea con ese nombre",
          });
        }

        conexion.query(
          "INSERT INTO tareas (nombre, completada) VALUES (?, ?)",
          [nombre, completada],
          (error, resultado) => {
            if (error) {
              return res.status(500).json({
                error: "Error al crear la tarea",
              });
            }

            res.status(201).json({
              id: resultado.insertId,
              nombre,
              completada,
            });
          },
        );
      },
    );
  },
);

app.put(
  "/tareas/:id",

  param("id")
    .isInt({ min: 1 })
    .withMessage("El ID debe ser un numero entero mayor que 0"),

  body("nombre")
    .exists()
    .withMessage("El nombre es obligatorio")
    .isString()
    .withMessage("El nombre debe ser texto")
    .trim()
    .notEmpty()
    .withMessage("El nombre no puede estar vacio")
    .isLength({ max: 255 })
    .withMessage("El nombre no puede superar los 255 caracteres"),

  body("completada")
    .exists()
    .withMessage("El estado completada es obligatorio")
    .isBoolean()
    .withMessage("El estado debe ser booleano"),

  (req, res) => {
    const errores = validationResult(req);

    if (!errores.isEmpty()) {
      return res.status(400).json({
        errores: errores.array(),
      });
    }

    const nombre = req.body.nombre.trim();
    const completada = req.body.completada;

    conexion.query(
      "SELECT * FROM tareas WHERE nombre = ? AND id != ?",
      [nombre, req.params.id],
      (error, resultados) => {
        if (error) {
          return res.status(500).json({
            error: "Error al verificar la tarea",
          });
        }

        if (resultados.length > 0) {
          return res.status(409).json({
            error: "Ya existe otra tarea con ese nombre",
          });
        }

        conexion.query(
          `UPDATE tareas
                     SET nombre = ?, completada = ?
                     WHERE id = ?`,
          [nombre, completada, req.params.id],
          (error, resultado) => {
            if (error) {
              return res.status(500).json({
                error: "Error al modificar la tarea",
              });
            }

            if (resultado.affectedRows === 0) {
              return res.status(404).json({
                error: "Tarea no encontrada",
              });
            }

            res.json({
              mensaje: "Tarea modificada correctamente",
            });
          },
        );
      },
    );
  },
);

app.delete(
  "/tareas/:id",

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
      "DELETE FROM tareas WHERE id = ?",
      [req.params.id],
      (error, resultado) => {
        if (error) {
          return res.status(500).json({
            error: "Error al eliminar la tarea",
          });
        }

        if (resultado.affectedRows === 0) {
          return res.status(404).json({
            error: "Tarea no encontrada",
          });
        }

        res.json({
          mensaje: "Tarea eliminada correctamente",
        });
      },
    );
  },
);

app.listen(3000, () => {
  console.log("Servidor funcionando en http://localhost:3000");
});
