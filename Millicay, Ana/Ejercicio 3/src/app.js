require('dotenv').config();
const express = require('express');
const materiasRoutes = require('./routes/materias.routes');
const calificacionesRoutes = require('./routes/calificaciones.routes');

const app = express();
app.use(express.json());

app.use('/materias', materiasRoutes);
app.use('/calificaciones', calificacionesRoutes);

app.use((req, res) => res.status(404).json({ error: 'Ruta no encontrada' }));

// JSON mal formado u otros errores
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'JSON inválido' });
  }
  console.error(err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor escuchando en http://localhost:${PORT}`));
