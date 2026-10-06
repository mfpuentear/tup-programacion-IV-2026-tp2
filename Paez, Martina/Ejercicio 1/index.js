require('dotenv').config();
require('express-async-errors');
const express = require('express');
const rectangulosRoutes = require('./rectangulosRoutes');

const app = express();
app.use(express.json());

app.use('/rectangulos', rectangulosRoutes);

app.use((req, res) => {
  res.status(404).json({ mensaje: 'Recurso no encontrado' });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ mensaje: 'Error interno del servidor' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Ejercicio 1 (rectangulos) escuchando en http://localhost:${PORT}`);
});
