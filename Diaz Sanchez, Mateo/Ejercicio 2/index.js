const express = require('express');
const { router: tareasRouter } = require('./tareas');
const pool = require('./db');

const app = express();
app.use(express.json({ limit: '16kb' }));
app.use('/tareas', tareasRouter);

app.use((error, req, res, next) => {
  if (error.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'Ya existe una tarea con ese nombre' });
  if (error instanceof SyntaxError && error.status === 400) return res.status(400).json({ error: 'El cuerpo debe contener JSON válido' });
  res.status(500).json({ error: 'Error interno del servidor' });
});

if (require.main === module) {
  const port = Number(process.env.PORT || 3002);
  const server = app.listen(port, () => console.log(`API de tareas escuchando en puerto ${port}`));

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