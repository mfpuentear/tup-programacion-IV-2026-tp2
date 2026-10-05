const express = require('express');
const materiasRoutes = require('./routes/materias.route');
const calificacionesRoutes = require('./routes/calificaciones.route');

const app = express();
const PORT = 3007;

app.use(express.json());
app.use('/api/materias', materiasRoutes);
app.use('/api/calificaciones', calificacionesRoutes);

app.listen(PORT, () => {
    console.log(`Servidor de Calificaciones ejecutándose en http://localhost:${PORT}`);
});