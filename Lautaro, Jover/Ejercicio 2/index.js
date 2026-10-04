import express from "express";
import { body, param, query, validationResult } from "express-validator";
import { pool } from "./db.js";

const app = express();
const port = 3002;

app.use(express.json());

// procesar errores de express-validator
const validarCampos = (req, res, next) => {
  const errores = validationResult(req);
  if (!errores.isEmpty()) {
    return res.status(400).json({ errores: errores.array() });
  }
  next();
};

// Validación de ID en parametros de ruta 
const validacionId = [
  param("id").isInt({ gt: 0 }).withMessage("El ID debe ser un número entero positivo"),
  validarCampos,
];

// Listar tareas con filtro opcional por estado
app.get(
  "/tareas",
  [
    query("estado")
      .optional()
      .isIn(["completadas", "pendientes"])
      .withMessage("El filtro 'estado' solo admite 'completadas' o 'pendientes'"),
    validarCampos,
  ],
  async (req, res) => {
    try {
      const { estado } = req.query;
      let consulta = "SELECT id, nombre, completada FROM tareas";

      if (estado === "completadas") {
        consulta += " WHERE completada = TRUE";
      } else if (estado === "pendientes") {
        consulta += " WHERE completada = FALSE";
      }

      const [filas] = await pool.query(consulta);
      res.json(filas);
    } catch (error) {
      res.status(500).json({ mensaje: "Error al consultar las tareas", detalle: error.message });
    }
  }
);

// Obtener una tarea por su ID
app.get("/tareas/:id", validacionId, async (req, res) => {
  try {
    const [filas] = await pool.query(
      "SELECT id, nombre, completada FROM tareas WHERE id = ?",
      [req.params.id]
    );

    if (filas.length === 0) {
      return res.status(404).json({ mensaje: "Tarea no encontrada" });
    }

    res.json(filas[0]);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al obtener la tarea", detalle: error.message });
  }
});

// Crear tarea con regla de unicidad y estado booleano
app.post(
  "/tareas",
  [
    body("nombre")
      .trim()
      .notEmpty()
      .withMessage("El nombre de la tarea es obligatorio y no puede quedar vacío"),
    body("completada")
      .optional()
      .isBoolean()
      .withMessage("El campo 'completada' debe ser un valor booleano (true o false)"),
    validarCampos,
  ],
  async (req, res) => {
    try {
      const nombreLimpio = req.body.nombre.trim();
      const completada = req.body.completada ?? false;

      // Criterio de comparación consistente insensible a mayúsculas y espacios
      const [duplicados] = await pool.query(
        "SELECT id FROM tareas WHERE LOWER(TRIM(nombre)) = LOWER(?)",
        [nombreLimpio]
      );

      if (duplicados.length > 0) {
        return res.status(400).json({
          mensaje: "Ya existe una tarea registrada con ese nombre (no se admiten duplicados)",
        });
      }

      const [resultado] = await pool.query(
        "INSERT INTO tareas (nombre, completada) VALUES (?, ?)",
        [nombreLimpio, completada]
      );

      res.status(201).json({
        id: resultado.insertId,
        nombre: nombreLimpio,
        completada: Boolean(completada),
      });
    } catch (error) {
      res.status(500).json({ mensaje: "Error al crear la tarea", detalle: error.message });
    }
  }
);

// Modificar tarea
app.put(
  "/tareas/:id",
  [
    ...validacionId,
    body("nombre")
      .trim()
      .notEmpty()
      .withMessage("El nombre es obligatorio y no puede quedar vacío"),
    body("completada")
      .isBoolean()
      .withMessage("El estado 'completada' es obligatorio y debe ser booleano (true o false)"),
    validarCampos,
  ],
  async (req, res) => {
    try {
      const id = req.params.id;

      // Comprobar existencia
      const [existente] = await pool.query("SELECT id FROM tareas WHERE id = ?", [id]);
      if (existente.length === 0) {
        return res.status(404).json({ mensaje: "Tarea no encontrada" });
      }

      const nombreLimpio = req.body.nombre.trim();
      const { completada } = req.body;

      // Excluyendo el propio registro que se modifica
      const [duplicados] = await pool.query(
        "SELECT id FROM tareas WHERE LOWER(TRIM(nombre)) = LOWER(?) AND id <> ?",
        [nombreLimpio, id]
      );

      if (duplicados.length > 0) {
        return res.status(400).json({
          mensaje: "Ya existe otra tarea registrada con ese mismo nombre",
        });
      }

      await pool.query(
        "UPDATE tareas SET nombre = ?, completada = ? WHERE id = ?",
        [nombreLimpio, completada, id]
      );

      res.json({
        id: Number(id),
        nombre: nombreLimpio,
        completada: Boolean(completada),
      });
    } catch (error) {
      res.status(500).json({ mensaje: "Error al actualizar la tarea", detalle: error.message });
    }
  }
);

// Eliminar tarea
app.delete("/tareas/:id", validacionId, async (req, res) => {
  try {
    const [resultado] = await pool.query("DELETE FROM tareas WHERE id = ?", [req.params.id]);

    if (resultado.affectedRows === 0) {
      return res.status(404).json({ mensaje: "Tarea no encontrada" });
    }

    res.json({ mensaje: "Tarea eliminada exitosamente" });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al eliminar la tarea", detalle: error.message });
  }
});

app.listen(port, () => console.log(`Servidor de Tareas corriendo en http://localhost:${port}`));