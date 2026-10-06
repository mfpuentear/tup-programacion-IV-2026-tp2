const express = require('express');
require('dotenv').config();

const rectangulosRoutes = require('./routes/rectangulosRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para leer formato JSON
app.use(express.json());

// Declaración de rutas principales
app.use('/api/rectangulos', rectangulosRoutes);

// Manejo de ruta no encontrada (404)
app.use((req, res) => {
  res.status(404).json({ status: 'error', message: 'Ruta no encontrada' });
});

app.listen(PORT, () => {
  console.log(`Servidor iniciado en http://localhost:${PORT}`);
});