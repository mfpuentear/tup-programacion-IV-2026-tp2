const express = require('express');
const { body, validationResult } = require('express-validator');

const app = express();
app.use(express.json());

const estadosValidos = ['pendiente', 'en_progreso', 'completada'];

let tareas = [
  { id: 1, titulo: 'Leer el enunciado', descripcion: 'Revisar la consigna del TP', estado: 'pendiente', completada: false },
  { id: 2, titulo: 'Desarrollar API', descripcion: 'Implementar los endpoints', estado: 'en_progreso', completada: false },
];

let nextId = 3;

const validarTarea = [
  body('titulo').trim().notEmpty().withMessage('El título es obligatorio').isLength({ min: 3 }).withMessage('El título debe tener al menos 3 caracteres'),
  body('descripcion').optional({ nullable: true }).isLength({ min: 3 }).withMessage('La descripción debe tener al menos 3 caracteres'),
  body('estado').isIn(estadosValidos).withMessage('El estado debe ser pendiente, en_progreso o completada'),
  body('completada').isBoolean().withMessage('El campo completada debe ser un valor booleano'),
  body('titulo').custom((valor, { req }) => {
    const titulo = valor.trim();
    const tareaExistente = tareas.find((tarea) => tarea.titulo.toLowerCase() === titulo.toLowerCase() && tarea.id !== Number(req.params.id || 0));

    if (tareaExistente) {
      throw new Error('Ya existe una tarea con ese título');
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

app.get('/tareas', (req, res) => {
  const { estado } = req.query;
  const resultado = estado
    ? tareas.filter((tarea) => tarea.estado === estado)
    : tareas;

  res.json(resultado);
});

app.get('/tareas/:id', (req, res) => {
  const id = Number(req.params.id);
  const tarea = tareas.find((item) => item.id === id);

  if (!tarea) {
    return res.status(404).json({ mensaje: 'Tarea no encontrada' });
  }

  res.json(tarea);
});

app.post('/tareas', validarTarea, manejarValidacion, (req, res) => {
  const nuevaTarea = {
    id: nextId++,
    titulo: req.body.titulo.trim(),
    descripcion: req.body.descripcion?.trim() || '',
    estado: req.body.estado,
    completada: req.body.completada,
  };

  tareas.push(nuevaTarea);
  res.status(201).json(nuevaTarea);
});

app.put('/tareas/:id', validarTarea, manejarValidacion, (req, res) => {
  const id = Number(req.params.id);
  const index = tareas.findIndex((item) => item.id === id);

  if (index === -1) {
    return res.status(404).json({ mensaje: 'Tarea no encontrada' });
  }

  tareas[index] = {
    ...tareas[index],
    titulo: req.body.titulo.trim(),
    descripcion: req.body.descripcion?.trim() || '',
    estado: req.body.estado,
    completada: req.body.completada,
  };

  res.json(tareas[index]);
});

app.delete('/tareas/:id', (req, res) => {
  const id = Number(req.params.id);
  const index = tareas.findIndex((item) => item.id === id);

  if (index === -1) {
    return res.status(404).json({ mensaje: 'Tarea no encontrada' });
  }

  const eliminada = tareas[index];
  tareas = tareas.filter((item) => item.id !== id);
  res.json({ mensaje: 'Tarea eliminada', tarea: eliminada });
});

app.use((req, res) => {
  res.status(404).json({ mensaje: 'Ruta no encontrada' });
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`Ejercicio 2 escuchando en http://localhost:${PORT}`);
});
