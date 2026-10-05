import { app } from './src/index.js';

const PORT = 3991;
process.env.PORT = String(PORT);
process.env.NODE_ENV = 'test';

const server = app.listen(PORT, async () => {
  console.log(`[TEST] Servidor de prueba iniciado en http://localhost:${PORT}`);

  try {
    const baseUrl = `http://localhost:${PORT}`;

    // 1. Verificar ruta raíz
    console.log('Test 1: GET / (Documentación de la API)');
    const resRoot = await fetch(`${baseUrl}/`);
    const dataRoot = await resRoot.json();
    console.assert(resRoot.status === 200, 'Root status debe ser 200');
    console.assert(dataRoot.nombre.includes('Rectángulos'), 'Nombre de la API correcto');
    console.log('✓ Test 1 superado');

    // 2. Verificar rechazo si cliente envía perímetro o superficie
    console.log('Test 2: POST /api/rectangulos enviando perímetro (debe dar 400 Bad Request)');
    const resPerimetro = await fetch(`${baseUrl}/api/rectangulos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lado1: 10, lado2: 5, perimetro: 30 })
    });
    const dataPerimetro = await resPerimetro.json();
    console.assert(resPerimetro.status === 400, 'Debe devolver status 400');
    console.assert(dataPerimetro.errores.some(e => e.campo === 'perimetro'), 'Error debe señalar el campo perimetro');
    console.log('✓ Test 2 superado');

    // 3. Verificar rechazo si lado1 es negativo
    console.log('Test 3: POST /api/rectangulos con lado negativo (debe dar 400 Bad Request)');
    const resNegativo = await fetch(`${baseUrl}/api/rectangulos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lado1: -5, lado2: 10 })
    });
    console.assert(resNegativo.status === 400, 'Debe devolver status 400 para lados negativos');
    console.log('✓ Test 3 superado');

    // 4. Verificar validación de parámetros (ID inválido)
    console.log('Test 4: GET /api/rectangulos/invalido (debe dar 400 Bad Request)');
    const resIdInvalido = await fetch(`${baseUrl}/api/rectangulos/abc`);
    console.assert(resIdInvalido.status === 400, 'Debe devolver status 400 para id no numérico');
    console.log('✓ Test 4 superado');

    // 5. Verificar validación de query params (esCuadrado inválido)
    console.log('Test 5: GET /api/rectangulos?esCuadrado=otro (debe dar 400 Bad Request)');
    const resQueryInvalida = await fetch(`${baseUrl}/api/rectangulos?esCuadrado=otro`);
    console.assert(resQueryInvalida.status === 400, 'Debe devolver status 400 para query param desconocido');
    console.log('✓ Test 5 superado');

    console.log('\n=============================================');
    console.log(' ¡Todas las pruebas de validación pasaron con éxito!');
    console.log('=============================================\n');
  } catch (error) {
    console.error('Error durante las pruebas:', error);
    process.exitCode = 1;
  } finally {
    server.close();
    process.exit(0);
  }
});
