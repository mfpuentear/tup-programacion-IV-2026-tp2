const express = require('express');
require('dotenv').config();

const rectanguloRoutes = require('./routes/rectangulo.routes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use('/api/rectangulos', rectanguloRoutes);

app.use((req, res) => {
    res.status(404).json({
        status: 'error',
        message: 'Ruta no encontrada'
    });
});

app.listen(PORT, () => {
    console.log(`Servidor iniciado en http://localhost:${PORT}`);
});