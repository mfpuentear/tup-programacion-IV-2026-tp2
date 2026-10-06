require('dotenv').config();

const express = require('express');
const rectanguloRoutes = require('./routes/rectanguloRoutes');

const app = express();

const PORT = process.env.PORT || 3000;

// Permite recibir JSON
app.use(express.json());

// Rutas
app.use('/', rectanguloRoutes);

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`API corriendo en: http://localhost:${PORT}`);
});