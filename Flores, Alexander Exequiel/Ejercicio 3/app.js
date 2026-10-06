import express from "express";
import { body, param, validationResult } from "express-validator";
import { pool } from "../../db.js";

const app = express();
const PORT = 3002;

app.use(express.json());

const NOTA_MIN = 0;
const NOTA_MAX = 10;

// ================== Validaciones ==================
const validarId = [
  param("id")
    .isInt({ gt: 0 })
    .withMessage("El id debe ser un entero positivo")
    .toInt(),
];

const validarNombreMateria = body("nombre")
  .exists({ checkFalsy: true })
  .withMessage("'nombre' es obligatorio")
  .bail()
  .isString()
  .trim()
  .isLength({ min: 1, max: 100 })
  .withMessage("'nombre' debe tener entre 1 y 100 caracteres");

const validarAlumnoNombre = body("alumno_nombre")
  .exists({ checkFalsy: true })
  .withMessage("'alumno_nombre' es obligatorio")
  .bail()
  .isString()
  .trim()
  .isLength({ min: 1, max: 100 })
  .withMessage("'alumno_nombre' debe tener entre 1 y 100 caracteres");

const validarMateriaId = body("materia_id")
  .exists()
  .withMessage("'materia_id' es obligatorio")
  .bail()
  .isInt({ gt: 0 })
  .withMessage("'materia_id' debe ser un entero positivo")
  .bail()
  .toInt()
  .custom(async (materiaId) => {
    const [filas] = await pool.query("SELECT id FROM materias WHERE id = ?", [
      materiaId,
    ]);
    if (filas.length === 0) {
      throw new Error("La materia indicada no existe");
    }
    return true;
  });

const validarNotas = body("notas")
  .isArray({ min: 3, max: 3 })
  .withMessage("'notas' debe ser un arreglo de exactamente 3 valores")
  .bail()
  .custom((notas) => {
    const invalida = notas.some(
      (n) =>
        typeof n !== "number" ||
        !Number.isFinite(n) ||
        n < NOTA_MIN ||
        n > NOTA_MAX,
    );
    if (invalida) {
      throw new Error(
        `Cada nota debe ser un número entre ${NOTA_MIN} y ${NOTA_MAX}`,
      );
    }
    return true;
  });

function manejarValidacion(req, res, next) {
  const errores = validationResult(req);
  if (!errores.isEmpty()) {
    return res.status(400).json({ errores: errores.array().map((e) => e.msg) });
  }
  next();
}

async function combinacionYaExiste(alumnoNombre, materiaId, idExcluido = null) {
  const [filas] = await pool.query(
    "SELECT id FROM calificaciones WHERE alumno_nombre = ? AND materia_id = ? AND id != ?",
    [alumnoNombre, materiaId, idExcluido ?? 0],
  );
  return filas.length > 0;
}

// ================== Lógica derivada ==================
function calcularPromedio(n1, n2, n3) {
  return Number(((Number(n1) + Number(n2) + Number(n3)) / 3).toFixed(2));
}

function calcularCondicion(promedio) {
  if (promedio < 6) return "reprobado";
  if (promedio < 8) return "aprobado";
  return "promocionado";
}

function presentarCalificacion(fila) {
  const promedio = calcularPromedio(fila.nota_1, fila.nota_2, fila.nota_3);
  return {
    id: fila.id,
    alumno_nombre: fila.alumno_nombre,
    materia_id: fila.materia_id,
    materia_nombre: fila.materia_nombre,
    notas: [Number(fila.nota_1), Number(fila.nota_2), Number(fila.nota_3)],
    promedio,
    condicion: calcularCondicion(promedio),
  };
}

const SELECT_CALIFICACION = `
  SELECT c.*, m.nombre AS materia_nombre
  FROM calificaciones c
  JOIN materias m ON m.id = c.materia_id
`;

// ================== Rutas: materias ==================
const routerMaterias = express.Router();

routerMaterias.get("/", async (req, res, next) => {
  try {
    const [filas] = await pool.query("SELECT * FROM materias ORDER BY id");
    res.json(filas);
  } catch (err) {
    next(err);
  }
});

routerMaterias.get(
  "/:id",
  validarId,
  manejarValidacion,
  async (req, res, next) => {
    try {
      const [filas] = await pool.query("SELECT * FROM materias WHERE id = ?", [
        req.params.id,
      ]);
      if (filas.length === 0) {
        return res.status(404).json({ error: "Materia no encontrada" });
      }
      res.json(filas[0]);
    } catch (err) {
      next(err);
    }
  },
);

routerMaterias.post(
  "/",
  validarNombreMateria,
  manejarValidacion,
  async (req, res, next) => {
    try {
      const nombre = req.body.nombre;

      const [existentes] = await pool.query(
        "SELECT id FROM materias WHERE nombre = ?",
        [nombre],
      );
      if (existentes.length > 0) {
        return res
          .status(409)
          .json({ error: `Ya existe una materia con el nombre '${nombre}'` });
      }

      const [resultado] = await pool.query(
        "INSERT INTO materias (nombre) VALUES (?)",
        [nombre],
      );
      res.status(201).location(`/materias/${resultado.insertId}`).json({
        id: resultado.insertId,
        nombre,
      });
    } catch (err) {
      next(err);
    }
  },
);

routerMaterias.put(
  "/:id",
  [...validarId, validarNombreMateria],
  manejarValidacion,
  async (req, res, next) => {
    try {
      const nombre = req.body.nombre;

      const [existentes] = await pool.query(
        "SELECT id FROM materias WHERE nombre = ? AND id != ?",
        [nombre, req.params.id],
      );
      if (existentes.length > 0) {
        return res
          .status(409)
          .json({ error: `Ya existe una materia con el nombre '${nombre}'` });
      }

      const [resultado] = await pool.query(
        "UPDATE materias SET nombre = ? WHERE id = ?",
        [nombre, req.params.id],
      );
      if (resultado.affectedRows === 0) {
        return res.status(404).json({ error: "Materia no encontrada" });
      }

      res.json({ id: Number(req.params.id), nombre });
    } catch (err) {
      next(err);
    }
  },
);

routerMaterias.delete(
  "/:id",
  validarId,
  manejarValidacion,
  async (req, res, next) => {
    try {
      const [resultado] = await pool.query(
        "DELETE FROM materias WHERE id = ?",
        [req.params.id],
      );
      if (resultado.affectedRows === 0) {
        return res.status(404).json({ error: "Materia no encontrada" });
      }
      res.status(204).send();
    } catch (err) {
      if (err.errno === 1451) {
        return res
          .status(409)
          .json({
            error:
              "No se puede eliminar: la materia tiene calificaciones asociadas",
          });
      }
      next(err);
    }
  },
);

// ================== Rutas: calificaciones ==================
const routerCalificaciones = express.Router();

routerCalificaciones.get("/", async (req, res, next) => {
  try {
    const [filas] = await pool.query(`${SELECT_CALIFICACION} ORDER BY c.id`);
    res.json(filas.map(presentarCalificacion));
  } catch (err) {
    next(err);
  }
});

routerCalificaciones.get(
  "/:id",
  validarId,
  manejarValidacion,
  async (req, res, next) => {
    try {
      const [filas] = await pool.query(
        `${SELECT_CALIFICACION} WHERE c.id = ?`,
        [req.params.id],
      );
      if (filas.length === 0) {
        return res.status(404).json({ error: "Calificación no encontrada" });
      }
      res.json(presentarCalificacion(filas[0]));
    } catch (err) {
      next(err);
    }
  },
);

routerCalificaciones.post(
  "/",
  [validarAlumnoNombre, validarMateriaId, validarNotas],
  manejarValidacion,
  async (req, res, next) => {
    try {
      const { alumno_nombre, materia_id, notas } = req.body;

      if (await combinacionYaExiste(alumno_nombre, materia_id)) {
        return res.status(409).json({
          error: `Ya existe una calificación de '${alumno_nombre}' para esa materia`,
        });
      }

      const [resultado] = await pool.query(
        "INSERT INTO calificaciones (alumno_nombre, materia_id, nota_1, nota_2, nota_3) VALUES (?, ?, ?, ?, ?)",
        [alumno_nombre, materia_id, notas[0], notas[1], notas[2]],
      );

      const [filas] = await pool.query(
        `${SELECT_CALIFICACION} WHERE c.id = ?`,
        [resultado.insertId],
      );

      res
        .status(201)
        .location(`/calificaciones/${resultado.insertId}`)
        .json(presentarCalificacion(filas[0]));
    } catch (err) {
      next(err);
    }
  },
);

routerCalificaciones.put(
  "/:id",
  [...validarId, validarAlumnoNombre, validarMateriaId, validarNotas],
  manejarValidacion,
  async (req, res, next) => {
    try {
      const { alumno_nombre, materia_id, notas } = req.body;

      if (await combinacionYaExiste(alumno_nombre, materia_id, req.params.id)) {
        return res.status(409).json({
          error: `Ya existe una calificación de '${alumno_nombre}' para esa materia`,
        });
      }

      const [resultado] = await pool.query(
        "UPDATE calificaciones SET alumno_nombre = ?, materia_id = ?, nota_1 = ?, nota_2 = ?, nota_3 = ? WHERE id = ?",
        [
          alumno_nombre,
          materia_id,
          notas[0],
          notas[1],
          notas[2],
          req.params.id,
        ],
      );

      if (resultado.affectedRows === 0) {
        return res.status(404).json({ error: "Calificación no encontrada" });
      }

      const [filas] = await pool.query(
        `${SELECT_CALIFICACION} WHERE c.id = ?`,
        [req.params.id],
      );
      res.json(presentarCalificacion(filas[0]));
    } catch (err) {
      next(err);
    }
  },
);

routerCalificaciones.delete(
  "/:id",
  validarId,
  manejarValidacion,
  async (req, res, next) => {
    try {
      const [resultado] = await pool.query(
        "DELETE FROM calificaciones WHERE id = ?",
        [req.params.id],
      );
      if (resultado.affectedRows === 0) {
        return res.status(404).json({ error: "Calificación no encontrada" });
      }
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },
);

app.use("/materias", routerMaterias);
app.use("/calificaciones", routerCalificaciones);

// ================== 404 y errores ==================
app.use((req, res) => {
  res.status(404).json({ error: "Ruta no encontrada" });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Error interno del servidor" });
});

app.listen(PORT, () => console.log(`Ejercicio 3 en http://localhost:${PORT}`));
