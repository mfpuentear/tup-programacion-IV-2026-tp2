const express = require('express');
require('dotenv').config();

// 1. Verificar las importaciones
const calificacionRoutes = require('./routes/calificacionRoutes');
const materiaRoutes = require('./routes/materiaRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// 2. Usar los routers exportados
app.use('/api/calificaciones', calificacionRoutes);
app.use('/api/materias', materiaRoutes);

app.use((req, res) => {
  res.status(404).json({ message: 'Ruta no encontrada' });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});