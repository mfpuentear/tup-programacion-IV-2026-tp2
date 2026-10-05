import express from "express";
import { body, param, validationResult } from "express-validator";
import { pool } from "./db.js";

const app = express();
const port = 3003;

app.use(express.json());

// Middleware común para responder con errores de express-validator
const validarCampos = (req, res, next) => {
  const errores = validationResult(req);
  if (!errores.isEmpty()) {
    return res.status(400).json({ errores: errores.array() });
  }
  next();
};

// Validación de ID en parámetros de ruta (params)
const validacionId = [
  param("id").isInt({ gt: 0 }).withMessage("El ID debe ser un número entero positivo"),
  validarCampos,
];

// Validación de calificaciones y escala documentada (0 a 10)
const validacionCalificacion = [
  body("alumno")
    .trim()
    .notEmpty()
    .withMessage("El nombre del alumno es obligatorio y no puede estar vacío"),
  body("materia_id")
    .isInt({ gt: 0 })
    .withMessage("El materia_id debe ser un número entero positivo correspondiente a una materia existente"),
  body("nota1")
    .isFloat({ min: 0, max: 10 })
    .withMessage("La nota 1 es obligatoria y debe estar en la escala documentada de 0 a 10"),
  body("nota2")
    .isFloat({ min: 0, max: 10 })
    .withMessage("La nota 2 es obligatoria y debe estar en la escala documentada de 0 a 10"),
  body("nota3")
    .isFloat({ min: 0, max: 10 })
    .withMessage("La nota 3 es obligatoria y debe estar en la escala documentada de 0 a 10"),
  validarCampos,
];

// RECURSO MATERIAS

// Listar todas las materias
app.get("/materias", async (req, res) => {
  try {
    const [filas] = await pool.query("SELECT id, nombre FROM materias");
    res.json(filas);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al consultar materias", detalle: error.message });
  }
});

// Obtener una materia específica
app.get("/materias/:id", validacionId, async (req, res) => {
  try {
    const [filas] = await pool.query("SELECT id, nombre FROM materias WHERE id = ?", [req.params.id]);
    if (filas.length === 0) {
      return res.status(404).json({ mensaje: "Materia no encontrada" });
    }
    res.json(filas[0]);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al consultar la materia", detalle: error.message });
  }
});

// CALIFICACIONES

// Listar todos los registros con JOIN al nombre de la materia
app.get("/calificaciones", async (req, res) => {
  try {
    const consulta = `
      SELECT 
        c.id, 
        c.alumno, 
        c.materia_id, 
        m.nombre AS materia, 
        c.nota1, 
        c.nota2, 
        c.nota3
      FROM calificaciones c
      JOIN materias m ON c.materia_id = m.id
      ORDER BY c.id ASC
    `;
    const [filas] = await pool.query(consulta);
    res.json(filas);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al consultar calificaciones", detalle: error.message });
  }
});

// Obtener una calificación por ID
app.get("/calificaciones/:id", validacionId, async (req, res) => {
  try {
    const consulta = `
      SELECT 
        c.id, 
        c.alumno, 
        c.materia_id, 
        m.nombre AS materia, 
        c.nota1, 
        c.nota2, 
        c.nota3
      FROM calificaciones c
      JOIN materias m ON c.materia_id = m.id
      WHERE c.id = ?
    `;
    const [filas] = await pool.query(consulta, [req.params.id]);
    if (filas.length === 0) {
      return res.status(404).json({ mensaje: "Registro de calificación no encontrado" });
    }
    res.json(filas[0]);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al consultar la calificación", detalle: error.message });
  }
});

// Crear calificación validando materia y regla de unicidad
app.post("/calificaciones", validacionCalificacion, async (req, res) => {
  try {
    const alumnoLimpio = req.body.alumno.trim();
    const { materia_id, nota1, nota2, nota3 } = req.body;

    // 1. Verificar existencia de la materia referenciada
    const [materia] = await pool.query("SELECT id, nombre FROM materias WHERE id = ?", [materia_id]);
    if (materia.length === 0) {
      return res.status(404).json({ mensaje: `La materia con id ${materia_id} no existe` });
    }

    // 2. Comprobar regla de unicidad: que no exista registro previo para esa combinación alumno-materia
    const [duplicados] = await pool.query(
      "SELECT id FROM calificaciones WHERE LOWER(TRIM(alumno)) = LOWER(?) AND materia_id = ?",
      [alumnoLimpio, materia_id]
    );

    if (duplicados.length > 0) {
      return res.status(400).json({
        mensaje: `El alumno '${alumnoLimpio}' ya posee calificaciones registradas para la materia '${materia[0].nombre}' (regla de unicidad)`,
      });
    }

    // 3. Insertar registro
    const [resultado] = await pool.query(
      "INSERT INTO calificaciones (alumno, materia_id, nota1, nota2, nota3) VALUES (?, ?, ?, ?, ?)",
      [alumnoLimpio, materia_id, parseFloat(nota1), parseFloat(nota2), parseFloat(nota3)]
    );

    res.status(201).json({
      id: resultado.insertId,
      alumno: alumnoLimpio,
      materia_id: Number(materia_id),
      materia: materia[0].nombre,
      nota1: parseFloat(nota1),
      nota2: parseFloat(nota2),
      nota3: parseFloat(nota3),
    });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al registrar calificaciones", detalle: error.message });
  }
});

// Modificar calificaciones garantizando unicidad
app.put("/calificaciones/:id", [...validacionId, ...validacionCalificacion], async (req, res) => {
  try {
    const id = req.params.id;

    // 1. Verificar existencia de la calificación
    const [actual] = await pool.query("SELECT id FROM calificaciones WHERE id = ?", [id]);
    if (actual.length === 0) {
      return res.status(404).json({ mensaje: "Registro de calificación no encontrado" });
    }

    const alumnoLimpio = req.body.alumno.trim();
    const { materia_id, nota1, nota2, nota3 } = req.body;

    // 2. Verificar existencia de la materia
    const [materia] = await pool.query("SELECT id, nombre FROM materias WHERE id = ?", [materia_id]);
    if (materia.length === 0) {
      return res.status(404).json({ mensaje: `La materia con id ${materia_id} no existe` });
    }

    // 3. Verificar unicidad excluyendo el propio ID que se está editando
    const [duplicados] = await pool.query(
      "SELECT id FROM calificaciones WHERE LOWER(TRIM(alumno)) = LOWER(?) AND materia_id = ? AND id <> ?",
      [alumnoLimpio, materia_id, id]
    );

    if (duplicados.length > 0) {
      return res.status(400).json({
        mensaje: `No se puede modificar: ya existe otro registro para el alumno '${alumnoLimpio}' en la materia '${materia[0].nombre}'`,
      });
    }

    // 4. Actualizar
    await pool.query(
      "UPDATE calificaciones SET alumno = ?, materia_id = ?, nota1 = ?, nota2 = ?, nota3 = ? WHERE id = ?",
      [alumnoLimpio, materia_id, parseFloat(nota1), parseFloat(nota2), parseFloat(nota3), id]
    );

    res.json({
      id: Number(id),
      alumno: alumnoLimpio,
      materia_id: Number(materia_id),
      materia: materia[0].nombre,
      nota1: parseFloat(nota1),
      nota2: parseFloat(nota2),
      nota3: parseFloat(nota3),
    });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al actualizar calificaciones", detalle: error.message });
  }
});

// Eliminar calificación
app.delete("/calificaciones/:id", validacionId, async (req, res) => {
  try {
    const [resultado] = await pool.query("DELETE FROM calificaciones WHERE id = ?", [req.params.id]);

    if (resultado.affectedRows === 0) {
      return res.status(404).json({ mensaje: "Registro de calificación no encontrado" });
    }

    res.json({ mensaje: "Calificación eliminada correctamente" });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al eliminar calificación", detalle: error.message });
  }
});

app.listen(port, () => console.log(`Servidor de Calificaciones corriendo en http://localhost:${port}`));