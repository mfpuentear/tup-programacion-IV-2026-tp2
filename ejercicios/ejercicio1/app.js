const express = require('express');
const rectanguloRoutes = require('./routes/rectanguloRoutes');
require('dotenv').config();

const app = express();

app.use(express.json());

// Montar router de rectángulos
app.use('/api/rectangulos', rectanguloRoutes);

// Manejo de recursos inexistentes (404)
app.use((req, res) => {
  res.status(404).json({ status: 'error', message: 'Ruta no encontrada.' });
});

// Middleware global de gestión de errores (500)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    status: 'error',
    message: 'Error interno del servidor.'
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor iniciado y escuchando en el puerto ${PORT}`);
});