const express = require('express');
require('dotenv').config();

const calificacionRoutes = require('./routes/calificacion.routes');
const materiaRoutes = require('./routes/materia.routes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use('/api/calificaciones', calificacionRoutes);
app.use('/api/materias', materiaRoutes);

app.use((req, res) => {
    res.status(404).json({
        status: 'error',
        message: 'Ruta no encontrada'
    });
});

app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
