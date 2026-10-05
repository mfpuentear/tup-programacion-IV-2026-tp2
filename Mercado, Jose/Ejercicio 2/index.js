const express = require('express');
require('dotenv').config();
const tareasRoutes = require('./tareas');

const app = express();
app.use(express.json());

app.use('/api/tareas', tareasRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Servidor del Ejercicio 2 corriendo en el puerto ${PORT}`);
});