const express = require('express');
require('dotenv').config();

const alumnosRoutes = require('./routes/alumnos');
const materiasRoutes = require('./routes/materias');
const calificacionesRoutes = require('./routes/calificaciones');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    message: 'API de calificaciones',
    endpoints: [
      'GET /alumnos',
      'GET /materias',
      'GET /calificaciones',
      'POST /alumnos',
      'POST /materias',
      'POST /calificaciones',
      'PUT /calificaciones/:id',
      'DELETE /calificaciones/:id'
    ]
  });
});

app.use('/alumnos', alumnosRoutes);
app.use('/materias', materiasRoutes);
app.use('/calificaciones', calificacionesRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Error interno del servidor', error: err.message });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
