const express = require('express');
require('dotenv').config();

const tareasRouter = require('./tareas');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use('/api/tareas', tareasRouter);

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
