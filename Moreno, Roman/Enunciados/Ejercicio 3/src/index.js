const express = require('express');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3003;

// Middlewares
app.use(express.json());

// Rutas
app.use('/api/materias', require('./routes/materias.routes'));
app.use('/api/calificaciones', require('./routes/calificaciones.routes'));

// Ruta raíz
app.get('/', (req, res) => {
  res.json({ ok: true, mensaje: 'API de Calificaciones funcionando correctamente 🚀' });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});