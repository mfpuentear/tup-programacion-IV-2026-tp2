const express = require('express');
require('dotenv').config();

const rectangulosRoutes = require('./routes/rectangulos');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    message: 'API de gestión de rectángulos',
    endpoints: [
      'GET /rectangulos',
      'GET /rectangulos/:id',
      'POST /rectangulos',
      'PUT /rectangulos/:id',
      'DELETE /rectangulos/:id'
    ]
  });
});

app.use('/rectangulos', rectangulosRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Error interno del servidor', error: err.message });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
