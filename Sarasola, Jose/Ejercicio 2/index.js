const express = require("express");
const pool = require("./db");
const {
  soloCamposBody,
  soloQuery,
  validarId,
  validarTarea,
  validarFiltroEstado,
} = require("./validators");
require("dotenv").config();

const app = express();
const PORT = Number(process.env.PORT || 3002);

app.use(express.json());

function normalizarNombre(nombre) {
  return nombre.trim().replace(/\s+/g, " ").toLowerCase();
}

function tareaRespuesta(tarea) {
  return {
    id: tarea.id,
    nombre: tarea.nombre,
    completada: Boolean(tarea.completada),
  };
}

app.get(
  "/tareas",
  soloQuery(["estado"]),
  validarFiltroEstado,
  async (req, res, next) => {
    try {
      let sql = "SELECT id, nombre, completada FROM tareas";
      const params = [];

      if (req.query.estado === "completadas") {
        sql += " WHERE completada = ?";
        params.push(true);
      } else if (req.query.estado === "pendientes") {
        sql += " WHERE completada = ?";
        params.push(false);
      }

      sql += " ORDER BY id";
      const [filas] = await pool.execute(sql, params);

      return res.status(200).json(filas.map(tareaRespuesta));
    } catch (error) {
      next(error);
    }
  }
);

app.get("/tareas/:id", validarId, async (req, res, next) => {
  try {
    const [filas] = await pool.execute(
      "SELECT id, nombre, completada FROM tareas WHERE id = ?",
      [req.params.id]
    );

    if (filas.length === 0) {
      return res.status(404).json({ error: "Tarea no encontrada." });
    }

    return res.status(200).json(tareaRespuesta(filas[0]));
  } catch (error) {
    next(error);
  }
});

app.post(
  "/tareas",
  soloCamposBody(["nombre", "completada"]),
  validarTarea,
  async (req, res, next) => {
    try {
      const nombre = req.body.nombre.trim().replace(/\s+/g, " ");
      const nombreNormalizado = normalizarNombre(nombre);
      const { completada } = req.body;

      const [existentes] = await pool.execute(
        "SELECT id FROM tareas WHERE nombre_normalizado = ?",
        [nombreNormalizado]
      );

      if (existentes.length > 0) {
        return res.status(409).json({
          error: "Ya existe una tarea con ese nombre.",
        });
      }

      const [resultado] = await pool.execute(
        `INSERT INTO tareas (nombre, nombre_normalizado, completada)
         VALUES (?, ?, ?)`,
        [nombre, nombreNormalizado, completada]
      );

      return res.status(201).json({
        id: resultado.insertId,
        nombre,
        completada,
      });
    } catch (error) {
      if (error.code === "ER_DUP_ENTRY") {
        return res.status(409).json({ error: "Ya existe una tarea con ese nombre." });
      }
      next(error);
    }
  }
);

app.put(
  "/tareas/:id",
  validarId,
  soloCamposBody(["nombre", "completada"]),
  validarTarea,
  async (req, res, next) => {
    try {
      const [actual] = await pool.execute("SELECT id FROM tareas WHERE id = ?", [
        req.params.id,
      ]);

      if (actual.length === 0) {
        return res.status(404).json({ error: "Tarea no encontrada." });
      }

      const nombre = req.body.nombre.trim().replace(/\s+/g, " ");
      const nombreNormalizado = normalizarNombre(nombre);
      const { completada } = req.body;

      const [duplicadas] = await pool.execute(
        "SELECT id FROM tareas WHERE nombre_normalizado = ? AND id <> ?",
        [nombreNormalizado, req.params.id]
      );

      if (duplicadas.length > 0) {
        return res.status(409).json({
          error: "Ya existe otra tarea con ese nombre.",
        });
      }

      await pool.execute(
        `UPDATE tareas
         SET nombre = ?, nombre_normalizado = ?, completada = ?
         WHERE id = ?`,
        [nombre, nombreNormalizado, completada, req.params.id]
      );

      return res.status(200).json({
        id: req.params.id,
        nombre,
        completada,
      });
    } catch (error) {
      if (error.code === "ER_DUP_ENTRY") {
        return res.status(409).json({ error: "Ya existe otra tarea con ese nombre." });
      }
      next(error);
    }
  }
);

app.delete("/tareas/:id", validarId, async (req, res, next) => {
  try {
    const [resultado] = await pool.execute("DELETE FROM tareas WHERE id = ?", [
      req.params.id,
    ]);

    if (resultado.affectedRows === 0) {
      return res.status(404).json({ error: "Tarea no encontrada." });
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
    console.log(`Ejercicio 2 ejecutándose en http://localhost:${PORT}`);
    console.log("Conexión con MySQL correcta.");
  } catch (error) {
    console.error("No se pudo conectar con MySQL:", error.message);
  }
});
