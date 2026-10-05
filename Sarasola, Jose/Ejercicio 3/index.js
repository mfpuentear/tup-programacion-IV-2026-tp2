const express = require("express");
const pool = require("./db");
const {
  soloCamposBody,
  soloQuery,
  validarId,
  validarMateria,
  validarCalificacion,
  validarFiltroMateria,
} = require("./validators");
require("dotenv").config();

const app = express();
const PORT = Number(process.env.PORT || 3003);

app.use(express.json());

function normalizarNombre(nombre) {
  return nombre.trim().replace(/\s+/g, " ").toLowerCase();
}

async function obtenerMateria(id) {
  const [filas] = await pool.execute(
    "SELECT id, nombre FROM materias WHERE id = ?",
    [id]
  );
  return filas[0] || null;
}

async function obtenerCalificacion(id) {
  const [filas] = await pool.execute(
    `SELECT c.id,
            c.alumno,
            c.nota1,
            c.nota2,
            c.nota3,
            m.id AS materia_id,
            m.nombre AS materia_nombre
     FROM calificaciones c
     INNER JOIN materias m ON m.id = c.materia_id
     WHERE c.id = ?`,
    [id]
  );

  if (filas.length === 0) return null;

  const fila = filas[0];
  return {
    id: fila.id,
    alumno: fila.alumno,
    materia: {
      id: fila.materia_id,
      nombre: fila.materia_nombre,
    },
    notas: [fila.nota1, fila.nota2, fila.nota3],
  };
}

// ---------------- MATERIAS ----------------

app.get("/materias", soloQuery([]), async (req, res, next) => {
  try {
    const [filas] = await pool.execute(
      "SELECT id, nombre FROM materias ORDER BY nombre"
    );
    return res.status(200).json(filas);
  } catch (error) {
    next(error);
  }
});

app.get("/materias/:id", validarId, async (req, res, next) => {
  try {
    const materia = await obtenerMateria(req.params.id);

    if (!materia) {
      return res.status(404).json({ error: "Materia no encontrada." });
    }

    return res.status(200).json(materia);
  } catch (error) {
    next(error);
  }
});

app.post(
  "/materias",
  soloCamposBody(["nombre"]),
  validarMateria,
  async (req, res, next) => {
    try {
      const nombre = req.body.nombre.trim().replace(/\s+/g, " ");
      const normalizado = normalizarNombre(nombre);

      const [existentes] = await pool.execute(
        "SELECT id FROM materias WHERE nombre_normalizado = ?",
        [normalizado]
      );

      if (existentes.length > 0) {
        return res.status(409).json({ error: "Ya existe una materia con ese nombre." });
      }

      const [resultado] = await pool.execute(
        "INSERT INTO materias (nombre, nombre_normalizado) VALUES (?, ?)",
        [nombre, normalizado]
      );

      return res.status(201).json({ id: resultado.insertId, nombre });
    } catch (error) {
      if (error.code === "ER_DUP_ENTRY") {
        return res.status(409).json({ error: "Ya existe una materia con ese nombre." });
      }
      next(error);
    }
  }
);

app.put(
  "/materias/:id",
  validarId,
  soloCamposBody(["nombre"]),
  validarMateria,
  async (req, res, next) => {
    try {
      const actual = await obtenerMateria(req.params.id);
      if (!actual) {
        return res.status(404).json({ error: "Materia no encontrada." });
      }

      const nombre = req.body.nombre.trim().replace(/\s+/g, " ");
      const normalizado = normalizarNombre(nombre);

      const [duplicadas] = await pool.execute(
        "SELECT id FROM materias WHERE nombre_normalizado = ? AND id <> ?",
        [normalizado, req.params.id]
      );

      if (duplicadas.length > 0) {
        return res.status(409).json({ error: "Ya existe otra materia con ese nombre." });
      }

      await pool.execute(
        "UPDATE materias SET nombre = ?, nombre_normalizado = ? WHERE id = ?",
        [nombre, normalizado, req.params.id]
      );

      return res.status(200).json({ id: req.params.id, nombre });
    } catch (error) {
      if (error.code === "ER_DUP_ENTRY") {
        return res.status(409).json({ error: "Ya existe otra materia con ese nombre." });
      }
      next(error);
    }
  }
);

app.delete("/materias/:id", validarId, async (req, res, next) => {
  try {
    const [resultado] = await pool.execute("DELETE FROM materias WHERE id = ?", [
      req.params.id,
    ]);

    if (resultado.affectedRows === 0) {
      return res.status(404).json({ error: "Materia no encontrada." });
    }

    return res.status(204).send();
  } catch (error) {
    if (error.code === "ER_ROW_IS_REFERENCED_2") {
      return res.status(409).json({
        error: "No se puede eliminar la materia porque posee calificaciones asociadas.",
      });
    }
    next(error);
  }
});

// ---------------- CALIFICACIONES ----------------

app.get(
  "/calificaciones",
  soloQuery(["materiaId"]),
  validarFiltroMateria,
  async (req, res, next) => {
    try {
      let sql = `SELECT c.id,
                        c.alumno,
                        c.nota1,
                        c.nota2,
                        c.nota3,
                        m.id AS materia_id,
                        m.nombre AS materia_nombre
                 FROM calificaciones c
                 INNER JOIN materias m ON m.id = c.materia_id`;
      const params = [];

      if (req.query.materiaId !== undefined) {
        sql += " WHERE c.materia_id = ?";
        params.push(req.query.materiaId);
      }

      sql += " ORDER BY c.id";
      const [filas] = await pool.execute(sql, params);

      return res.status(200).json(
        filas.map((fila) => ({
          id: fila.id,
          alumno: fila.alumno,
          materia: {
            id: fila.materia_id,
            nombre: fila.materia_nombre,
          },
          notas: [fila.nota1, fila.nota2, fila.nota3],
        }))
      );
    } catch (error) {
      next(error);
    }
  }
);

app.get("/calificaciones/:id", validarId, async (req, res, next) => {
  try {
    const calificacion = await obtenerCalificacion(req.params.id);

    if (!calificacion) {
      return res.status(404).json({ error: "Registro de calificaciones no encontrado." });
    }

    return res.status(200).json(calificacion);
  } catch (error) {
    next(error);
  }
});

app.post(
  "/calificaciones",
  soloCamposBody(["alumno", "materiaId", "notas"]),
  validarCalificacion,
  async (req, res, next) => {
    try {
      const alumno = req.body.alumno.trim().replace(/\s+/g, " ");
      const alumnoNormalizado = normalizarNombre(alumno);
      const { materiaId, notas } = req.body;

      const materia = await obtenerMateria(materiaId);
      if (!materia) {
        return res.status(400).json({ error: "La materia indicada no existe." });
      }

      const [duplicados] = await pool.execute(
        `SELECT id FROM calificaciones
         WHERE alumno_normalizado = ? AND materia_id = ?`,
        [alumnoNormalizado, materiaId]
      );

      if (duplicados.length > 0) {
        return res.status(409).json({
          error: "Ya existe un registro para ese alumno y esa materia.",
        });
      }

      const [resultado] = await pool.execute(
        `INSERT INTO calificaciones
         (alumno, alumno_normalizado, materia_id, nota1, nota2, nota3)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [alumno, alumnoNormalizado, materiaId, notas[0], notas[1], notas[2]]
      );

      return res.status(201).json(await obtenerCalificacion(resultado.insertId));
    } catch (error) {
      if (error.code === "ER_DUP_ENTRY") {
        return res.status(409).json({
          error: "Ya existe un registro para ese alumno y esa materia.",
        });
      }
      next(error);
    }
  }
);

app.put(
  "/calificaciones/:id",
  validarId,
  soloCamposBody(["alumno", "materiaId", "notas"]),
  validarCalificacion,
  async (req, res, next) => {
    try {
      const actual = await obtenerCalificacion(req.params.id);
      if (!actual) {
        return res.status(404).json({ error: "Registro de calificaciones no encontrado." });
      }

      const alumno = req.body.alumno.trim().replace(/\s+/g, " ");
      const alumnoNormalizado = normalizarNombre(alumno);
      const { materiaId, notas } = req.body;

      const materia = await obtenerMateria(materiaId);
      if (!materia) {
        return res.status(400).json({ error: "La materia indicada no existe." });
      }

      const [duplicados] = await pool.execute(
        `SELECT id FROM calificaciones
         WHERE alumno_normalizado = ? AND materia_id = ? AND id <> ?`,
        [alumnoNormalizado, materiaId, req.params.id]
      );

      if (duplicados.length > 0) {
        return res.status(409).json({
          error: "Ya existe otro registro para ese alumno y esa materia.",
        });
      }

      await pool.execute(
        `UPDATE calificaciones
         SET alumno = ?, alumno_normalizado = ?, materia_id = ?, nota1 = ?, nota2 = ?, nota3 = ?
         WHERE id = ?`,
        [
          alumno,
          alumnoNormalizado,
          materiaId,
          notas[0],
          notas[1],
          notas[2],
          req.params.id,
        ]
      );

      return res.status(200).json(await obtenerCalificacion(req.params.id));
    } catch (error) {
      if (error.code === "ER_DUP_ENTRY") {
        return res.status(409).json({
          error: "Ya existe otro registro para ese alumno y esa materia.",
        });
      }
      next(error);
    }
  }
);

app.delete("/calificaciones/:id", validarId, async (req, res, next) => {
  try {
    const [resultado] = await pool.execute(
      "DELETE FROM calificaciones WHERE id = ?",
      [req.params.id]
    );

    if (resultado.affectedRows === 0) {
      return res.status(404).json({ error: "Registro de calificaciones no encontrado." });
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
    console.log(`Ejercicio 3 ejecutándose en http://localhost:${PORT}`);
    console.log("Conexión con MySQL correcta.");
  } catch (error) {
    console.error("No se pudo conectar con MySQL:", error.message);
  }
});
