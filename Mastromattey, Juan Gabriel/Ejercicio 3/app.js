const express = require("express");
const { body, param, validationResult } = require("express-validator");

const conexion = require("./db");

const app = express();

app.use(express.json());

app.get("/materias", (req, res) => {
  conexion.query("SELECT * FROM materias", (error, resultados) => {
    if (error) {
      return res.status(500).json({
        error: "Error al obtener las materias",
      });
    }

    res.json(resultados);
  });
});

app.post(
  "/materias",

  body("nombre")
    .exists()
    .withMessage("El nombre de la materia es obligatorio")
    .isString()
    .withMessage("El nombre debe ser texto")
    .trim()
    .notEmpty()
    .withMessage("El nombre no puede estar vacio")
    .isLength({ max: 100 })
    .withMessage("El nombre no puede superar los 100 caracteres"),

  (req, res) => {
    const errores = validationResult(req);

    if (!errores.isEmpty()) {
      return res.status(400).json({
        errores: errores.array(),
      });
    }

    const nombre = req.body.nombre.trim();

    conexion.query(
      "INSERT INTO materias (nombre) VALUES (?)",
      [nombre],
      (error, resultado) => {
        if (error) {
          if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
              error: "La materia ya existe",
            });
          }

          return res.status(500).json({
            error: "Error al crear la materia",
          });
        }

        res.status(201).json({
          id: resultado.insertId,
          nombre,
        });
      },
    );
  },
);

app.get(
  "/materias/:id",

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
      "SELECT * FROM materias WHERE id = ?",
      [req.params.id],
      (error, resultados) => {
        if (error) {
          return res.status(500).json({
            error: "Error al buscar la materia",
          });
        }

        if (resultados.length === 0) {
          return res.status(404).json({
            error: "Materia no encontrada",
          });
        }

        res.json(resultados[0]);
      },
    );
  },
);

app.put(
  "/materias/:id",

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
    .withMessage("El nombre no puede estar vacio"),

  (req, res) => {
    const errores = validationResult(req);

    if (!errores.isEmpty()) {
      return res.status(400).json({
        errores: errores.array(),
      });
    }

    const nombre = req.body.nombre.trim();

    conexion.query(
      "UPDATE materias SET nombre = ? WHERE id = ?",
      [nombre, req.params.id],
      (error, resultado) => {
        if (error) {
          if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
              error: "La materia ya existe",
            });
          }

          return res.status(500).json({
            error: "Error al modificar la materia",
          });
        }

        if (resultado.affectedRows === 0) {
          return res.status(404).json({
            error: "Materia no encontrada",
          });
        }

        res.json({
          mensaje: "Materia modificada correctamente",
        });
      },
    );
  },
);

app.delete(
  "/materias/:id",

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
      "DELETE FROM materias WHERE id = ?",
      [req.params.id],
      (error, resultado) => {
        if (error) {
          if (error.code === "ER_ROW_IS_REFERENCED_2") {
            return res.status(409).json({
              error:
                "No se puede eliminar la materia porque tiene calificaciones asociadas",
            });
          }

          return res.status(500).json({
            error: "Error al eliminar la materia",
          });
        }

        if (resultado.affectedRows === 0) {
          return res.status(404).json({
            error: "Materia no encontrada",
          });
        }

        res.json({
          mensaje: "Materia eliminada correctamente",
        });
      },
    );
  },
);

app.get("/calificaciones", (req, res) => {
  const sql = `
        SELECT
            calificaciones.id,
            calificaciones.alumno,
            materias.nombre AS materia,
            calificaciones.nota1,
            calificaciones.nota2,
            calificaciones.nota3
        FROM calificaciones
        INNER JOIN materias
            ON calificaciones.materia_id = materias.id
    `;

  conexion.query(sql, (error, resultados) => {
    if (error) {
      return res.status(500).json({
        error: "Error al obtener las calificaciones",
      });
    }

    res.json(resultados);
  });
});

app.get(
  "/calificaciones/:id",

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

    const sql = `
            SELECT
                calificaciones.id,
                calificaciones.alumno,
                materias.nombre AS materia,
                calificaciones.nota1,
                calificaciones.nota2,
                calificaciones.nota3
            FROM calificaciones
            INNER JOIN materias
                ON calificaciones.materia_id = materias.id
            WHERE calificaciones.id = ?
        `;

    conexion.query(sql, [req.params.id], (error, resultados) => {
      if (error) {
        return res.status(500).json({
          error: "Error al buscar la calificacion",
        });
      }

      if (resultados.length === 0) {
        return res.status(404).json({
          error: "Calificacion no encontrada",
        });
      }

      res.json(resultados[0]);
    });
  },
);

app.post(
  "/calificaciones",

  body("alumno")
    .exists()
    .withMessage("El nombre del alumno es obligatorio")
    .isString()
    .withMessage("El nombre del alumno debe ser texto")
    .trim()
    .notEmpty()
    .withMessage("El nombre del alumno no puede estar vacio")
    .isLength({ max: 150 })
    .withMessage("El nombre no puede superar los 150 caracteres"),

  body("materia_id")
    .exists()
    .withMessage("La materia es obligatoria")
    .isInt({ min: 1 })
    .withMessage("La materia_id debe ser un numero entero mayor que 0"),

  body("nota1")
    .exists()
    .withMessage("La nota1 es obligatoria")
    .isFloat({ min: 0, max: 10 })
    .withMessage("La nota1 debe estar entre 0 y 10"),

  body("nota2")
    .exists()
    .withMessage("La nota2 es obligatoria")
    .isFloat({ min: 0, max: 10 })
    .withMessage("La nota2 debe estar entre 0 y 10"),

  body("nota3")
    .exists()
    .withMessage("La nota3 es obligatoria")
    .isFloat({ min: 0, max: 10 })
    .withMessage("La nota3 debe estar entre 0 y 10"),

  (req, res) => {
    const errores = validationResult(req);

    if (!errores.isEmpty()) {
      return res.status(400).json({
        errores: errores.array(),
      });
    }

    const { alumno, materia_id, nota1, nota2, nota3 } = req.body;

    conexion.query(
      "SELECT * FROM materias WHERE id = ?",
      [materia_id],
      (error, materias) => {
        if (error) {
          return res.status(500).json({
            error: "Error al verificar la materia",
          });
        }

        if (materias.length === 0) {
          return res.status(400).json({
            error: "La materia no existe",
          });
        }

        conexion.query(
          `SELECT * FROM calificaciones
                     WHERE alumno = ? AND materia_id = ?`,
          [alumno.trim(), materia_id],
          (error, existentes) => {
            if (error) {
              return res.status(500).json({
                error: "Error al verificar la calificacion",
              });
            }

            if (existentes.length > 0) {
              return res.status(409).json({
                error: "El alumno ya tiene una calificacion para esa materia",
              });
            }

            conexion.query(
              `INSERT INTO calificaciones
                            (alumno, materia_id, nota1, nota2, nota3)
                            VALUES (?, ?, ?, ?, ?)`,
              [alumno.trim(), materia_id, nota1, nota2, nota3],
              (error, resultado) => {
                if (error) {
                  return res.status(500).json({
                    error: "Error al crear la calificacion",
                  });
                }

                res.status(201).json({
                  id: resultado.insertId,
                  alumno: alumno.trim(),
                  materia_id,
                  nota1,
                  nota2,
                  nota3,
                });
              },
            );
          },
        );
      },
    );
  },
);

app.put(
  "/calificaciones/:id",

  param("id")
    .isInt({ min: 1 })
    .withMessage("El ID debe ser un numero entero mayor que 0"),

  body("alumno")
    .exists()
    .withMessage("El nombre del alumno es obligatorio")
    .isString()
    .withMessage("El nombre del alumno debe ser texto")
    .trim()
    .notEmpty()
    .withMessage("El nombre del alumno no puede estar vacio"),

  body("materia_id")
    .exists()
    .withMessage("La materia es obligatoria")
    .isInt({ min: 1 })
    .withMessage("La materia_id debe ser un numero entero mayor que 0"),

  body("nota1")
    .exists()
    .withMessage("La nota1 es obligatoria")
    .isFloat({ min: 0, max: 10 })
    .withMessage("La nota1 debe estar entre 0 y 10"),

  body("nota2")
    .exists()
    .withMessage("La nota2 es obligatoria")
    .isFloat({ min: 0, max: 10 })
    .withMessage("La nota2 debe estar entre 0 y 10"),

  body("nota3")
    .exists()
    .withMessage("La nota3 es obligatoria")
    .isFloat({ min: 0, max: 10 })
    .withMessage("La nota3 debe estar entre 0 y 10"),

  (req, res) => {
    const errores = validationResult(req);

    if (!errores.isEmpty()) {
      return res.status(400).json({
        errores: errores.array(),
      });
    }

    const { alumno, materia_id, nota1, nota2, nota3 } = req.body;

    conexion.query(
      "SELECT * FROM materias WHERE id = ?",
      [materia_id],
      (error, materias) => {
        if (error) {
          return res.status(500).json({
            error: "Error al verificar la materia",
          });
        }

        if (materias.length === 0) {
          return res.status(400).json({
            error: "La materia no existe",
          });
        }

        conexion.query(
          `SELECT * FROM calificaciones
                     WHERE alumno = ?
                     AND materia_id = ?
                     AND id != ?`,
          [alumno.trim(), materia_id, req.params.id],
          (error, existentes) => {
            if (error) {
              return res.status(500).json({
                error: "Error al verificar la calificacion",
              });
            }

            if (existentes.length > 0) {
              return res.status(409).json({
                error: "El alumno ya tiene otra calificacion para esa materia",
              });
            }

            conexion.query(
              `UPDATE calificaciones
                             SET alumno = ?,
                                 materia_id = ?,
                                 nota1 = ?,
                                 nota2 = ?,
                                 nota3 = ?
                             WHERE id = ?`,
              [alumno.trim(), materia_id, nota1, nota2, nota3, req.params.id],
              (error, resultado) => {
                if (error) {
                  return res.status(500).json({
                    error: "Error al modificar la calificacion",
                  });
                }

                if (resultado.affectedRows === 0) {
                  return res.status(404).json({
                    error: "Calificacion no encontrada",
                  });
                }

                res.json({
                  mensaje: "Calificacion modificada correctamente",
                });
              },
            );
          },
        );
      },
    );
  },
);

app.delete(
  "/calificaciones/:id",

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
      "DELETE FROM calificaciones WHERE id = ?",
      [req.params.id],
      (error, resultado) => {
        if (error) {
          return res.status(500).json({
            error: "Error al eliminar la calificacion",
          });
        }

        if (resultado.affectedRows === 0) {
          return res.status(404).json({
            error: "Calificacion no encontrada",
          });
        }

        res.json({
          mensaje: "Calificacion eliminada correctamente",
        });
      },
    );
  },
);

app.listen(3000, () => {
  console.log("Servidor funcionando en http://localhost:3000");
});
