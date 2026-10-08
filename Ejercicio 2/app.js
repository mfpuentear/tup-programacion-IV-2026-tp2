const express = require('express');
const taskRoutes = require('./routes/task.routes.js');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

app.use('/api/tasks', taskRoutes);

app.listen(PORT, () => {
  console.log(`Servidor de Ejercicio 2 escuchando en el puerto ${PORT}`);
});