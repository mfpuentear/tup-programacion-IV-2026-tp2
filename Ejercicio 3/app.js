const express = require('express');
const gradeRoutes = require('./routes/grade.routes');

const app = express();
const PORT = process.env.PORT || 3002;

app.use(express.json());

// Montar rutas de la API
app.use('/api', gradeRoutes);

// Ruta no encontrada
app.use((req, res) => {
  res.status(404).json({ status: 'fail', message: 'Ruta no encontrada.' });
});

app.listen(PORT, () => {
  console.log(`Servidor del Ejercicio 3 escuchando en el puerto ${PORT}`);
});