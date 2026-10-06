const express = require('express');
require('dotenv').config();

const materiasRoutes = require('./routes/materias.routes');
const notasRoutes = require('./routes/notas.routes');
const errorHandler = require('./middlewares/error.middleware');

const app = express();


app.use(express.json());


app.use('/api/materias', materiasRoutes);
app.use('/api/calificaciones', notasRoutes);


app.use((req, res) => {
  res.status(404).json({ status: 'fail', message: 'Ruta no encontrada' });
});

app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor iniciado correctamente en el puerto ${PORT}`);
});