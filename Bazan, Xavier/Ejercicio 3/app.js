const express = require('express');
const { body, validationResult } = require('express-validator');

const app = express();
app.use(express.json());

const alumnos = [
  { id: 1, nombre: 'Ana' },
  { id: 2, nombre: 'Bruno' },
];

const materias = [
  { id: 1, nombre: 'Programación IV' },
  { id: 2, nombre: 'Base de Datos' },
];

let calificaciones = [
  { id: 1, alumnoId: 1, materiaId: 1, nota: 8 },
  { id: 2, alumnoId: 2, materiaId: 2, nota: 9 },
];

let nextId = 3;

const validarCalificacion = [
  body('alumnoId').isInt({ min: 1 }).withMessage('El alumno es obligatorio'),
  body('materiaId').isInt({ min: 1 }).withMessage('La materia es obligatoria'),
  body('nota').isFloat({ min: 0, max: 10 }).withMessage('La nota debe estar entre 0 y 10'),
  body('alumnoId').custom((valor) => {
    if (!alumnos.some((alumno) => alumno.id === Number(valor))) {
      throw new Error('El alumno no existe');
    }
    return true;
  }),
  body('materiaId').custom((valor) => {
    if (!materias.some((materia) => materia.id === Number(valor))) {
      throw new Error('La materia no existe');
    }
    return true;
  }),
  body('alumnoId').custom((valor, { req }) => {
    const alumnoId = Number(valor);
    const materiaId = Number(req.body.materiaId);

    if (calificaciones.some((item) => item.alumnoId === alumnoId && item.materiaId === materiaId)) {
      throw new Error('Ya existe una calificación para ese alumno y materia');
    }

    return true;
  }),
];

const manejarValidacion = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

app.get('/alumnos', (req, res) => {
  res.json(alumnos);
});

app.get('/materias', (req, res) => {
  res.json(materias);
});

app.get('/calificaciones', (req, res) => {
  res.json(calificaciones);
});

app.post('/calificaciones', validarCalificacion, manejarValidacion, (req, res) => {
  const nuevaCalificacion = {
    id: nextId++,
    alumnoId: Number(req.body.alumnoId),
    materiaId: Number(req.body.materiaId),
    nota: Number(req.body.nota),
  };

  calificaciones.push(nuevaCalificacion);
  res.status(201).json(nuevaCalificacion);
});

app.get('/alumnos/:id/promedio', (req, res) => {
  const id = Number(req.params.id);
  const notas = calificaciones.filter((item) => item.alumnoId === id).map((item) => item.nota);

  if (!notas.length) {
    return res.json({ alumnoId: id, promedio: 0 });
  }

  const promedio = notas.reduce((total, nota) => total + nota, 0) / notas.length;
  res.json({ alumnoId: id, promedio: Number(promedio.toFixed(2)) });
});

app.get('/materias/:id/promedio', (req, res) => {
  const id = Number(req.params.id);
  const notas = calificaciones.filter((item) => item.materiaId === id).map((item) => item.nota);

  if (!notas.length) {
    return res.json({ materiaId: id, promedio: 0 });
  }

  const promedio = notas.reduce((total, nota) => total + nota, 0) / notas.length;
  res.json({ materiaId: id, promedio: Number(promedio.toFixed(2)) });
});

app.use((req, res) => {
  res.status(404).json({ mensaje: 'Ruta no encontrada' });
});

const PORT = process.env.PORT || 3003;
app.listen(PORT, () => {
  console.log(`Ejercicio 3 escuchando en http://localhost:${PORT}`);
});
