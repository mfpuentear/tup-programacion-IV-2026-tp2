
const express = require('express');
require('dotenv').config();
const calificacionesRoutes = require('./calificaciones');

const app = express();
app.use(express.json());

app.use('/api/calificaciones', calificacionesRoutes);

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
    console.log(`Servidor del Ejercicio 3 corriendo en el puerto ${PORT}`);
});