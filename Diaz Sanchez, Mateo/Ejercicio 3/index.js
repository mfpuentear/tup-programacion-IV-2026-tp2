const express = require('express');
const materiasRouter = require('./materias');
const calificacionesRouter = require('./calificaciones');
const pool = require('./db');

const app = express();
app.use(express.json({ limit: '16kb' }));
app.use('/', materiasRouter);
app.use('/calificaciones', calificacionesRouter);

app.use((error, req, res, next) => {
  if (error.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'Ya existe un registro con esos datos únicos' });
  if (error.code === 'ER_ROW_IS_REFERENCED_2') return res.status(409).json({ error: 'No se puede eliminar una materia que tiene calificaciones asociadas' });
  if (error instanceof SyntaxError && error.status === 400) return res.status(400).json({ error: 'El cuerpo debe contener JSON válido' });
  res.status(500).json({ error: 'Error interno del servidor' });
});

if (require.main === module) {
  const port = Number(process.env.PORT || 3003);
  const server = app.listen(port, () => console.log(`API de calificaciones escuchando en puerto ${port}`));

  const shutdown = async () => {
    server.close(async () => {
      await pool.end();
      process.exit(0);
    });
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

module.exports = app;