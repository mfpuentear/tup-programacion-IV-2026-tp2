const express = require('express');
require('dotenv').config();

const tareasRoutes = require('./routes/tareas');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    message: 'API de gestión de tareas',
    endpoints: [
      'GET /tareas',
      'GET /tareas/:id',
      'POST /tareas',
      'PUT /tareas/:id',
      'DELETE /tareas/:id'
    ]
  });
});

app.use('/tareas', tareasRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Error interno del servidor', error: err.message });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
