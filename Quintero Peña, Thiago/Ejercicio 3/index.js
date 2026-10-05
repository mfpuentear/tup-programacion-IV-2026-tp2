const express = require('express');
require('dotenv').config();

const calificacionesRouter = require('./calificaciones');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use('/api/calificaciones', calificacionesRouter);

app.listen(PORT, () => {
  console.log(`Servidor de Calificaciones corriendo en el puerto ${PORT}`);
});
