const express = require('express');
require('dotenv').config();

const tareasRoutes = require('./routes/tareasRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use('/api/tareas', tareasRoutes);

app.use((req, res) => {
  res.status(404).json({ status: 'error', message: 'Ruta no encontrada' });
});

app.listen(PORT, () => {
  console.log(`Servidor de tareas iniciado en http://localhost:${PORT}`);
});