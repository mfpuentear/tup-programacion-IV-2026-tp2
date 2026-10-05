import express from 'express';
import dotenv from 'dotenv';
import rectangulosRoutes from './routes/rectangulos.routes.js';
import { initDatabase } from './config/db.js';

dotenv.config();

export const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(express.json());

// Ruta raíz con información y documentación de la API
app.get('/', (req, res) => {
  res.json({
    nombre: 'API de Gestión de Rectángulos',
    version: '1.0.0',
    descripcion: 'API REST para administrar rectángulos con persistencia en MySQL y validaciones con express-validator.',
    autor: 'Federico Merlo Brac',
    recursos: {
      rectangulos: '/api/rectangulos'
    },
    ejemplos: {
      listar_todos: 'GET /api/rectangulos',
      filtrar_cuadrados: 'GET /api/rectangulos?esCuadrado=true',
      filtrar_orden: 'GET /api/rectangulos?orden=desc&limite=5',
      obtener_uno: 'GET /api/rectangulos/1',
      crear: 'POST /api/rectangulos (body: { "lado1": 10, "lado2": 5 })',
      modificar: 'PUT /api/rectangulos/1 (body: { "lado1": 12, "lado2": 6 })',
      eliminar: 'DELETE /api/rectangulos/1'
    }
  });
});

// Rutas de la API
app.use('/api/rectangulos', rectangulosRoutes);

// Manejador de rutas no encontradas (404)
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    mensaje: `La ruta '${req.method} ${req.originalUrl}' no existe en esta API.`
  });
});

// Manejador centralizado de errores
app.use((err, req, res, next) => {
  console.error(`[Error no controlado]:`, err);

  // Error de conexión o consulta de base de datos MySQL
  if (err.code === 'ECONNREFUSED' || err.code === 'ER_ACCESS_DENIED_ERROR') {
    return res.status(500).json({
      status: 'error',
      mensaje: 'Error de conexión con la base de datos MySQL. Verifique las credenciales en el archivo .env',
      detalle: err.message
    });
  }

  res.status(err.status || 500).json({
    status: 'error',
    mensaje: err.message || 'Error interno del servidor'
  });
});

import { fileURLToPath } from 'url';

// Iniciar el servidor si se ejecuta directamente este archivo
const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isMain) {
  initDatabase().catch((err) => {
    console.error('Error al inicializar base de datos:', err.message);
  });

  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(` Servidor de Rectángulos corriendo en:`);
    console.log(` http://localhost:${PORT}`);
    console.log(` Documentación de endpoints en http://localhost:${PORT}/`);
    console.log(`====================================================`);
  });
}
