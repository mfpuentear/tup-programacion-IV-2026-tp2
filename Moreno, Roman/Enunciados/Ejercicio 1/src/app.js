const express = require('express');
const rectangulosRoutes = require('./routes/rectangulos');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/rectangulos', rectangulosRoutes);

app.get('/', (req, res) => {
  res.json({ mensaje: 'API de Rectángulos - Ejercicio 1' });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Recurso no encontrado' });
});

module.exports = app;
