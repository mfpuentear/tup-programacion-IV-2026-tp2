import express from 'express';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import tareasRoutes from './routes/tareas.routes.js';
import { initDatabase } from './config/db.js';

dotenv.config();

export const app = express();
const PORT = process.env.PORT || 3002;

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
        <title>Ejercicio 2 - API de Lista de Tareas</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 30px; background: #0f172a; color: #f8fafc; max-width: 900px; margin: 0 auto; line-height: 1.6; }
          h1 { color: #38bdf8; border-bottom: 2px solid #334155; padding-bottom: 12px; margin-bottom: 15px; }
          .card { background: #1e293b; padding: 22px; border-radius: 10px; margin-bottom: 20px; border: 1px solid #334155; }
          .badge { background: #0284c7; color: white; padding: 4px 10px; border-radius: 6px; font-size: 13px; font-weight: bold; }
          .btn { display: inline-block; background: #2563eb; color: white; padding: 10px 16px; border-radius: 6px; text-decoration: none; font-weight: 600; margin: 6px 6px 6px 0; transition: background 0.2s; }
          .btn:hover { background: #1d4ed8; }
          .btn-secondary { background: #475569; }
          .btn-secondary:hover { background: #334155; }
        </style>
      </head>
      <body>
        <h1>✅ Ejercicio 2: API de Gestión de Tareas</h1>
        <div class="card">
          <p><strong>Autor:</strong> Federico Merlo Brac | <span class="badge">MySQL Persistente con Unicidad</span></p>
          <p>Para ver los datos persistidos en la base de datos MySQL, haz clic en los siguientes enlaces directos:</p>
          <div style="margin: 15px 0;">
            <a class="btn" href="/api/tareas" target="_blank">📋 Ver Todas las Tareas (JSON)</a>
            <a class="btn btn-secondary" href="/api/tareas?estado=completadas" target="_blank">✔️ Tareas Completadas</a>
            <a class="btn btn-secondary" href="/api/tareas?estado=pendientes" target="_blank">⏳ Tareas Pendientes</a>
            <a class="btn btn-secondary" href="/api/tareas/1" target="_blank">🔍 Ver Tarea ID 1</a>
          </div>
        </div>
        <div class="card">
          <h3>📌 Métodos y Endpoints Disponibles</h3>
          <ul>
            <li><code>GET /api/tareas</code> - Listar todas las tareas (soporta ?estado=completadas|pendientes)</li>
            <li><code>GET /api/tareas/:id</code> - Obtener una tarea por ID</li>
            <li><code>POST /api/tareas</code> - Crear tarea (control de nombres únicos estricto)</li>
            <li><code>PUT /api/tareas/:id</code> - Modificar nombre y estado</li>
            <li><code>PATCH /api/tareas/:id/estado</code> - Cambiar únicamente el estado booleano</li>
            <li><code>DELETE /api/tareas/:id</code> - Eliminar tarea</li>
          </ul>
        </div>
      </body>
      </html>
    `);
  }

  res.json({
    nombre: 'API de Gestión de Tareas',
    version: '1.0.0',
    descripcion: 'API REST para administrar una lista de tareas con persistencia en MySQL, control de nombres únicos y filtrado por estado.',
    autor: 'Federico Merlo Brac',
    criterio_unicidad: 'Insensible a mayúsculas/minúsculas y normalización de espacios en blanco (trim y reducción de espacios múltiples a uno simple).',
    recursos: {
      tareas: '/api/tareas'
    },
    ejemplos: {
      listar_todas: 'GET /api/tareas',
      filtrar_completadas: 'GET /api/tareas?estado=completadas',
      filtrar_pendientes: 'GET /api/tareas?estado=pendientes',
      obtener_una: 'GET /api/tareas/1',
      crear: 'POST /api/tareas (body: { "nombre": "Estudiar para el examen", "estado": false })',
      modificar_completo: 'PUT /api/tareas/1 (body: { "nombre": "Estudiar Programación IV", "estado": true })',
      cambiar_estado: 'PATCH /api/tareas/1/estado (body: { "estado": true })',
      eliminar: 'DELETE /api/tareas/1'
    }
  });
});

// Rutas de la API
app.use('/api/tareas', tareasRoutes);

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

// Iniciar el servidor si se ejecuta directamente este archivo
const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isMain) {
  initDatabase().catch((err) => {
    console.error('Error al inicializar base de datos:', err.message);
  });

  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(` Servidor de Tareas corriendo en:`);
    console.log(` http://localhost:${PORT}`);
    console.log(` Documentación de endpoints en http://localhost:${PORT}/`);
    console.log(`====================================================`);
  });
}
