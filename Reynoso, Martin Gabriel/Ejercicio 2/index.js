import express from 'express';
import tareaRoutes from './routes/tareaRoutes.js';

const app = express();

app.use(express.json());

app.use('/api/tareas', tareaRoutes);

app.use((req, res) => {
  res.status(404).json({ status: 'error', message: 'Ruta no encontrada' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor iniciado en http://localhost:${PORT}`);
});