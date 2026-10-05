import express from 'express';
import dotenv from 'dotenv';
import rectangulosRoutes from './routes/rectangulos.routes.js';
import { initDatabase } from './config/db.js';

dotenv.config();

export const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(express.json());

// Ruta raíz con información y documentación interactiva
app.get('/', (req, res) => {
  const esNavegador = req.headers.accept && req.headers.accept.includes('text/html') && !req.headers.accept.includes('application/json');

  if (esNavegador) {
    return res.send(`
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <title>Ejercicio 1 - API de Rectángulos</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 30px; background: #0f172a; color: #f8fafc; max-width: 900px; margin: 0 auto; line-height: 1.6; }
          h1 { color: #38bdf8; border-bottom: 2px solid #334155; padding-bottom: 12px; margin-bottom: 15px; }
          .card { background: #1e293b; padding: 22px; border-radius: 10px; margin-bottom: 20px; border: 1px solid #334155; }
          .badge { background: #0284c7; color: white; padding: 4px 10px; border-radius: 6px; font-size: 13px; font-weight: bold; }
          .btn { display: inline-block; background: #2563eb; color: white; padding: 10px 16px; border-radius: 6px; text-decoration: none; font-weight: 600; margin: 6px 6px 6px 0; transition: background 0.2s; }
          .btn:hover { background: #1d4ed8; }
          .btn-secondary { background: #475569; }
          .btn-secondary:hover { background: #334155; }
          pre { background: #090d16; padding: 12px; border-radius: 6px; overflow-x: auto; color: #a5f3fc; }
        </style>
      </head>
      <body>
        <h1>📐 Ejercicio 1: API de Gestión de Rectángulos</h1>
        <div class="card">
          <p><strong>Autor:</strong> Federico Merlo Brac | <span class="badge">MySQL Persistente</span></p>
          <p>Esta es una API REST. Para ver los datos persistidos en la base de datos MySQL, haz clic en los siguientes enlaces directos:</p>
          <div style="margin: 15px 0;">
            <a class="btn" href="/api/rectangulos" target="_blank">📋 Ver Todos los Rectángulos (JSON)</a>
            <a class="btn btn-secondary" href="/api/rectangulos?esCuadrado=true" target="_blank">🟦 Filtrar Cuadrados</a>
            <a class="btn btn-secondary" href="/api/rectangulos?esCuadrado=false" target="_blank">▭ Filtrar No Cuadrados</a>
            <a class="btn btn-secondary" href="/api/rectangulos/1" target="_blank">🔍 Ver Rectángulo ID 1</a>
          </div>
        </div>
        <div class="card">
          <h3>📌 Métodos y Endpoints Disponibles</h3>
          <ul>
            <li><code>GET /api/rectangulos</code> - Listar todos los rectángulos guardados</li>
            <li><code>GET /api/rectangulos/:id</code> - Obtener rectángulo por ID</li>
            <li><code>POST /api/rectangulos</code> - Crear nuevo rectángulo (solo enviar lado1 y lado2)</li>
            <li><code>PUT /api/rectangulos/:id</code> - Modificar dimensiones</li>
            <li><code>DELETE /api/rectangulos/:id</code> - Eliminar de la base de datos</li>
          </ul>
        </div>
      </body>
      </html>
    `);
  }

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
