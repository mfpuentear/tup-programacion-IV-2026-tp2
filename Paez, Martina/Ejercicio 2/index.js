require('dotenv').config();
require('express-async-errors');
const express = require('express');
const tareasRoutes = require('./tareasRoutes');

const app = express();
app.use(express.json());

app.use('/tareas', tareasRoutes);

app.use((req, res) => {
  res.status(404).json({ mensaje: 'Recurso no encontrado' });
});

app.use((err, req, res, next) => {
  console.error(err);

  // Resguardo extra: si dos requests simultaneas pasan la validacion de
  // unicidad al mismo tiempo, la restriccion UNIQUE de la base es la que
  // finalmente lo impide. Se traduce ese error a un 409 prolijo.
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({ mensaje: 'Ya existe una tarea con ese nombre' });
  }

  res.status(500).json({ mensaje: 'Error interno del servidor' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Ejercicio 2 (tareas) escuchando en http://localhost:${PORT}`);
});
