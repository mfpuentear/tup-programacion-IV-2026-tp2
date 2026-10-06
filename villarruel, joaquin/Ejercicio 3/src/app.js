const express = require('express');

const materiasRoutes = require('./routes/materias.routes');
const calificacionesRoutes = require('./routes/calificaciones.routes');

const app = express();

app.use(express.json());

app.get('/', (req, res) => {
    res.json({
        mensaje: 'API de calificaciones funcionando'
    });
});

app.use('/materias', materiasRoutes);
app.use('/calificaciones', calificacionesRoutes);

const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});