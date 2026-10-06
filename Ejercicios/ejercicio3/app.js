const express = require('express');
require('dotenv').config();

const calificacionesRoutes = require('./routes/calificacionesRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use('/api/calificaciones', calificacionesRoutes);

app.use((req, res) => {
  res.status(404).json({ status: 'error', message: 'Ruta no encontrada' });
});

app.listen(PORT, () => {
  console.log(`Servidor de calificaciones iniciado en http://localhost:${PORT}`);
});