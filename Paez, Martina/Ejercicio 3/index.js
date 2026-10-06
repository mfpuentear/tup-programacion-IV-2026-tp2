require('dotenv').config();
require('express-async-errors');
const express = require('express');
const materiasRoutes = require('./materiasRoutes');
const calificacionesRoutes = require('./calificacionesRoutes');

const app = express();
app.use(express.json());

app.use('/materias', materiasRoutes);
app.use('/calificaciones', calificacionesRoutes);

app.use((req, res) => {
  res.status(404).json({ mensaje: 'Recurso no encontrado' });
});

app.use((err, req, res, next) => {
  console.error(err);

  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({ mensaje: 'El registro ya existe (nombre o combinacion duplicada)' });
  }
  if (err.code === 'ER_ROW_IS_REFERENCED_2' || err.code === 'ER_ROW_IS_REFERENCED') {
    return res.status(409).json({
      mensaje: 'No se puede eliminar: la materia tiene calificaciones asociadas',
    });
  }

  res.status(500).json({ mensaje: 'Error interno del servidor' });
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`Ejercicio 3 (calificaciones) escuchando en http://localhost:${PORT}`);
});
