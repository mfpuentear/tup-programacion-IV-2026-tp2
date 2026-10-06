import express from "express";
import { body, param, query, validationResult } from "express-validator";
import { pool } from "../../db.js";

const app = express();
const PORT = 3001;

app.use(express.json());

// ---------- Validaciones ----------
const validarNombre = body("nombre")
  .exists({ checkFalsy: true })
  .withMessage("'nombre' es obligatorio")
  .bail()
  .isString()
  .withMessage("'nombre' debe ser un texto")
  .bail()
  .trim()
  .isLength({ min: 1, max: 100 })
  .withMessage("'nombre' debe tener entre 1 y 100 caracteres");

const validarCompletadaOpcional = body("completada")
  .optional()
  .isBoolean()
  .withMessage("'completada' debe ser true o false")
  .toBoolean();

const validarCompletadaObligatoria = body("completada")
  .exists()
  .withMessage("'completada' es obligatorio")
  .bail()
  .isBoolean()
  .withMessage("'completada' debe ser true o false")
  .toBoolean();

const validarId = [
  param("id")
    .isInt({ gt: 0 })
    .withMessage("El id debe ser un entero positivo")
    .toInt(),
];

const validarFiltroCompletada = [
  query("completada")
    .optional()
    .isBoolean()
    .withMessage("'completada' debe ser 'true' o 'false'")
    .toBoolean(),
];

function manejarValidacion(req, res, next) {
  const errores = validationResult(req);
  if (!errores.isEmpty()) {
    return res.status(400).json({ errores: errores.array().map((e) => e.msg) });
  }
  next();
}

async function nombreYaExiste(nombre, idExcluido = null) {
  const [filas] = await pool.query(
    "SELECT id FROM tareas WHERE nombre = ? AND id != ?",
    [nombre, idExcluido ?? 0],
  );
  return filas.length > 0;
}

// ---------- Rutas ----------
const router = express.Router();

// Listar tareas (con filtro opcional ?completada=true|false)
router.get(
  "/",
  validarFiltroCompletada,
  manejarValidacion,
  async (req, res, next) => {
    try {
      const { completada } = req.query;

      if (completada === undefined) {
        const [filas] = await pool.query("SELECT * FROM tareas ORDER BY id");
        return res.json(filas);
      }

      const [filas] = await pool.query(
        "SELECT * FROM tareas WHERE completada = ? ORDER BY id",
        [completada],
      );
      res.json(filas);
    } catch (err) {
      next(err);
    }
  },
);

// Consultar una tarea
router.get("/:id", validarId, manejarValidacion, async (req, res, next) => {
  try {
    const [filas] = await pool.query("SELECT * FROM tareas WHERE id = ?", [
      req.params.id,
    ]);
    if (filas.length === 0) {
      return res.status(404).json({ error: "Tarea no encontrada" });
    }
    res.json(filas[0]);
  } catch (err) {
    next(err);
  }
});

// Crear tarea (completada es false por defecto)
router.post(
  "/",
  [validarNombre, validarCompletadaOpcional],
  manejarValidacion,
  async (req, res, next) => {
    try {
      const nombre = req.body.nombre;
      const completada = req.body.completada ?? false;

      if (await nombreYaExiste(nombre)) {
        return res
          .status(409)
          .json({ error: `Ya existe una tarea con el nombre '${nombre}'` });
      }

      const [resultado] = await pool.query(
        "INSERT INTO tareas (nombre, completada) VALUES (?, ?)",
        [nombre, completada],
      );

      res.status(201).location(`/tareas/${resultado.insertId}`).json({
        id: resultado.insertId,
        nombre,
        completada,
      });
    } catch (err) {
      next(err);
    }
  },
);

// Reemplazar tarea (nombre y completada obligatorios)
router.put(
  "/:id",
  [...validarId, validarNombre, validarCompletadaObligatoria],
  manejarValidacion,
  async (req, res, next) => {
    try {
      const { nombre, completada } = req.body;

      if (await nombreYaExiste(nombre, req.params.id)) {
        return res
          .status(409)
          .json({ error: `Ya existe una tarea con el nombre '${nombre}'` });
      }

      const [resultado] = await pool.query(
        "UPDATE tareas SET nombre = ?, completada = ? WHERE id = ?",
        [nombre, completada, req.params.id],
      );

      if (resultado.affectedRows === 0) {
        return res.status(404).json({ error: "Tarea no encontrada" });
      }

      res.json({ id: Number(req.params.id), nombre, completada });
    } catch (err) {
      next(err);
    }
  },
);

// Marcar como completada / pendiente (modificación parcial del estado)
router.patch(
  "/:id/completada",
  [...validarId, validarCompletadaObligatoria],
  manejarValidacion,
  async (req, res, next) => {
    try {
      const { completada } = req.body;

      const [resultado] = await pool.query(
        "UPDATE tareas SET completada = ? WHERE id = ?",
        [completada, req.params.id],
      );

      if (resultado.affectedRows === 0) {
        return res.status(404).json({ error: "Tarea no encontrada" });
      }

      const [filas] = await pool.query("SELECT * FROM tareas WHERE id = ?", [
        req.params.id,
      ]);
      res.json(filas[0]);
    } catch (err) {
      next(err);
    }
  },
);

// Eliminar tarea
router.delete("/:id", validarId, manejarValidacion, async (req, res, next) => {
  try {
    const [resultado] = await pool.query("DELETE FROM tareas WHERE id = ?", [
      req.params.id,
    ]);
    if (resultado.affectedRows === 0) {
      return res.status(404).json({ error: "Tarea no encontrada" });
    }
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

app.use("/tareas", router);

// ---------- 404 y errores ----------
app.use((req, res) => {
  res.status(404).json({ error: "Ruta no encontrada" });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Error interno del servidor" });
});

app.listen(PORT, () => console.log(`Ejercicio 2 en http://localhost:${PORT}`));
