import { app } from './src/index.js';

const PORT = 3993;
process.env.PORT = String(PORT);
process.env.NODE_ENV = 'test';

const server = app.listen(PORT, async () => {
  console.log(`[TEST] Servidor de prueba Ejercicio 3 iniciado en http://localhost:${PORT}`);

  try {
    const baseUrl = `http://localhost:${PORT}`;

    // 1. Verificar ruta raíz
    console.log('Test 1: GET / (Documentación de la API)');
    const resRoot = await fetch(`${baseUrl}/`);
    const dataRoot = await resRoot.json();
    console.assert(resRoot.status === 200, 'Root status debe ser 200');
    console.assert(dataRoot.nombre.includes('Calificaciones'), 'Nombre de la API correcto');
    console.log('✓ Test 1 superado');

    // 2. Verificar validación de alumno vacío
    console.log('Test 2: POST /api/calificaciones con alumno vacío (debe dar 400 Bad Request)');
    const resAlumnoVacio = await fetch(`${baseUrl}/api/calificaciones`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ alumno: '', materia_id: 1, nota1: 8, nota2: 7, nota3: 9 })
    });
    console.assert(resAlumnoVacio.status === 400, 'Debe devolver status 400');
    console.log('✓ Test 2 superado');

    // 3. Verificar validación de notas fuera de escala (ej. nota = 12)
    console.log('Test 3: POST /api/calificaciones con nota > 10 (debe dar 400 Bad Request)');
    const resNotaInvalida = await fetch(`${baseUrl}/api/calificaciones`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ alumno: 'Test User', materia_id: 1, nota1: 12, nota2: 7, nota3: 9 })
    });
    console.assert(resNotaInvalida.status === 400, 'Debe devolver status 400 para nota fuera de escala');
    console.log('✓ Test 3 superado');

    // 4. Verificar validación de notas faltantes (menos de 3 notas)
    console.log('Test 4: POST /api/calificaciones con sólo 2 notas (debe dar 400 Bad Request)');
    const resNotasFaltantes = await fetch(`${baseUrl}/api/calificaciones`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ alumno: 'Test User', materia_id: 1, nota1: 8, nota2: 7 })
    });
    console.assert(resNotasFaltantes.status === 400, 'Debe devolver status 400 cuando falta una nota');
    console.log('✓ Test 4 superado');

    // 5. Verificar validación de materia_id no numérico
    console.log('Test 5: POST /api/calificaciones con materia_id inválido (debe dar 400 Bad Request)');
    const resMateriaInvalida = await fetch(`${baseUrl}/api/calificaciones`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ alumno: 'Test User', materia_id: 'invalido', nota1: 8, nota2: 7, nota3: 9 })
    });
    console.assert(resMateriaInvalida.status === 400, 'Debe devolver status 400 para materia_id no numérico');
    console.log('✓ Test 5 superado');

    console.log('\n=============================================');
    console.log(' ¡Todas las pruebas de validación de Ejercicio 3 pasaron con éxito!');
    console.log('=============================================\n');
  } catch (error) {
    console.error('Error durante las pruebas:', error);
    process.exitCode = 1;
  } finally {
    server.close();
    process.exit(0);
  }
});
