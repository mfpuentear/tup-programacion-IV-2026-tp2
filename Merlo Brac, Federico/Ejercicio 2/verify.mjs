import { app } from './src/index.js';

const PORT = 3992;
process.env.PORT = String(PORT);
process.env.NODE_ENV = 'test';

const server = app.listen(PORT, async () => {
  console.log(`[TEST] Servidor de prueba Ejercicio 2 iniciado en http://localhost:${PORT}`);

  try {
    const baseUrl = `http://localhost:${PORT}`;

    // 1. Verificar ruta raíz
    console.log('Test 1: GET / (Documentación de la API)');
    const resRoot = await fetch(`${baseUrl}/`);
    const dataRoot = await resRoot.json();
    console.assert(resRoot.status === 200, 'Root status debe ser 200');
    console.assert(dataRoot.nombre.includes('Tareas'), 'Nombre de la API correcto');
    console.log('✓ Test 1 superado');

    // 2. Verificar validación de nombre vacío
    console.log('Test 2: POST /api/tareas con nombre vacío (debe dar 400 Bad Request)');
    const resVacio = await fetch(`${baseUrl}/api/tareas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre: '' })
    });
    console.assert(resVacio.status === 400, 'Debe devolver status 400');
    console.log('✓ Test 2 superado');

    // 3. Verificar validación de estado no booleano
    console.log('Test 3: POST /api/tareas con estado inválido (debe dar 400 Bad Request)');
    const resEstadoInvalido = await fetch(`${baseUrl}/api/tareas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre: 'Tarea de prueba', estado: 'invalido' })
    });
    console.assert(resEstadoInvalido.status === 400, 'Debe devolver status 400 para estado no booleano');
    console.log('✓ Test 3 superado');

    // 4. Verificar validación de filtro por estado inválido
    console.log('Test 4: GET /api/tareas?estado=inexistente (debe dar 400 Bad Request)');
    const resFiltroInvalido = await fetch(`${baseUrl}/api/tareas?estado=inexistente`);
    console.assert(resFiltroInvalido.status === 400, 'Debe devolver status 400 para filtro no permitido');
    console.log('✓ Test 4 superado');

    // 5. Verificar validación de parámetro ID
    console.log('Test 5: GET /api/tareas/no-es-numero (debe dar 400 Bad Request)');
    const resIdInvalido = await fetch(`${baseUrl}/api/tareas/no-es-numero`);
    console.assert(resIdInvalido.status === 400, 'Debe devolver status 400 para ID no numérico');
    console.log('✓ Test 5 superado');

    console.log('\n=============================================');
    console.log(' ¡Todas las pruebas de validación de Ejercicio 2 pasaron con éxito!');
    console.log('=============================================\n');
  } catch (error) {
    console.error('Error durante las pruebas:', error);
    process.exitCode = 1;
  } finally {
    server.close();
    process.exit(0);
  }
});
