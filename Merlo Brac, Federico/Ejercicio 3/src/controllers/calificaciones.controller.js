import { pool } from '../config/db.js';

/**
 * Normaliza nombres de alumnos para comparación estricta
 */
function normalizarAlumno(alumno) {
  if (typeof alumno !== 'string') return '';
  return alumno.trim().replace(/\s+/g, ' ').toLowerCase();
}

/**
 * Calcula promedio y condición académica
 */
function calcularDetalles(nota1, nota2, nota3) {
  const n1 = Number(nota1);
  const n2 = Number(nota2);
  const n3 = Number(nota3);
  const promedio = Number(((n1 + n2 + n3) / 3).toFixed(2));
  const aprobado = promedio >= 6.0 && n1 >= 4.0 && n2 >= 4.0 && n3 >= 4.0;
  return {
    promedio,
    condicion: aprobado ? 'Aprobado' : 'Desaprobado'
  };
}

/**
 * Obtiene todas las calificaciones registradas con información de materias vinculadas
 */
export async function getAllCalificaciones(req, res, next) {
  try {
    const { materia_id, alumno } = req.query;

    let sql = `
      SELECT 
        c.id,
        c.alumno,
        c.materia_id,
        m.nombre AS materia_nombre,
        m.codigo AS materia_codigo,
        c.nota1,
        c.nota2,
        c.nota3,
        c.fecha_registro
      FROM calificaciones c
      INNER JOIN materias m ON c.materia_id = m.id
    `;
    const params = [];
    const conditions = [];

    if (materia_id) {
      conditions.push('c.materia_id = ?');
      params.push(Number(materia_id));
    }

    if (alumno) {
      conditions.push('LOWER(c.alumno) LIKE ?');
      params.push(`%${alumno.toLowerCase().trim()}%`);
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }

    sql += ' ORDER BY c.id ASC';

    const [rows] = await pool.query(sql, params);

    const data = rows.map((r) => {
      const calc = calcularDetalles(r.nota1, r.nota2, r.nota3);
      return {
        id: r.id,
        alumno: r.alumno,
        materia: {
          id: r.materia_id,
          nombre: r.materia_nombre,
          codigo: r.materia_codigo
        },
        notas: [Number(r.nota1), Number(r.nota2), Number(r.nota3)],
        promedio: calc.promedio,
        condicion: calc.condicion,
        fecha_registro: r.fecha_registro
      };
    });

    return res.status(200).json(data);
  } catch (error) {
    next(error);
  }
}

/**
 * Obtiene una calificación por ID
 */
export async function getCalificacionById(req, res, next) {
  try {
    const { id } = req.params;
    const sql = `
      SELECT 
        c.id,
        c.alumno,
        c.materia_id,
        m.nombre AS materia_nombre,
        m.codigo AS materia_codigo,
        c.nota1,
        c.nota2,
        c.nota3,
        c.fecha_registro
      FROM calificaciones c
      INNER JOIN materias m ON c.materia_id = m.id
      WHERE c.id = ?
    `;

    const [rows] = await pool.query(sql, [id]);

    if (rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        mensaje: `No se encontró la calificación con ID ${id}`
      });
    }

    const r = rows[0];
    const calc = calcularDetalles(r.nota1, r.nota2, r.nota3);

    return res.status(200).json({
      id: r.id,
      alumno: r.alumno,
      materia: {
        id: r.materia_id,
        nombre: r.materia_nombre,
        codigo: r.materia_codigo
      },
      notas: [Number(r.nota1), Number(r.nota2), Number(r.nota3)],
      promedio: calc.promedio,
      condicion: calc.condicion,
      fecha_registro: r.fecha_registro
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Crea una nueva calificación.
 * 1. Verifica existencia de materia.
 * 2. Impide registros duplicados para la misma combinación alumno-materia.
 * 3. Valida y almacena exactamente 3 notas.
 */
export async function createCalificacion(req, res, next) {
  try {
    const { alumno, materia_id, nota1, nota2, nota3 } = req.body;
    const alumnoLimpio = alumno.trim().replace(/\s+/g, ' ');
    const alumnoNorm = normalizarAlumno(alumno);

    // 1. Verificar existencia de la materia
    const [materiaRows] = await pool.query('SELECT id, nombre FROM materias WHERE id = ?', [materia_id]);
    if (materiaRows.length === 0) {
      return res.status(400).json({
        status: 'error',
        mensaje: `La materia con ID ${materia_id} no existe en el sistema`
      });
    }

    // 2. Verificar regla de unicidad para la combinación alumno-materia
    const [existentes] = await pool.query(
      'SELECT id, alumno FROM calificaciones WHERE materia_id = ?',
      [materia_id]
    );
    const yaRegistrado = existentes.find((c) => normalizarAlumno(c.alumno) === alumnoNorm);

    if (yaRegistrado) {
      return res.status(409).json({
        status: 'error',
        mensaje: `El alumno '${alumnoLimpio}' ya cuenta con un registro de calificaciones para la materia '${materiaRows[0].nombre}' (ID ${materia_id}). No se permiten duplicados.`
      });
    }

    // 3. Insertar las 3 notas
    const n1 = Number(Number(nota1).toFixed(2));
    const n2 = Number(Number(nota2).toFixed(2));
    const n3 = Number(Number(nota3).toFixed(2));

    const [result] = await pool.query(
      'INSERT INTO calificaciones (alumno, materia_id, nota1, nota2, nota3) VALUES (?, ?, ?, ?, ?)',
      [alumnoLimpio, materia_id, n1, n2, n3]
    );

    const calc = calcularDetalles(n1, n2, n3);

    return res.status(201).json({
      mensaje: 'Calificación registrada exitosamente',
      calificacion: {
        id: result.insertId,
        alumno: alumnoLimpio,
        materia_id: Number(materia_id),
        materia_nombre: materiaRows[0].nombre,
        notas: [n1, n2, n3],
        promedio: calc.promedio,
        condicion: calc.condicion
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Modifica una calificación existente.
 * 1. Verifica existencia de calificación.
 * 2. Verifica existencia de materia.
 * 3. Impide registros duplicados para la combinación alumno-materia al modificar.
 */
export async function updateCalificacion(req, res, next) {
  try {
    const { id } = req.params;
    const { alumno, materia_id, nota1, nota2, nota3 } = req.body;

    // 1. Verificar existencia de la calificación
    const [califExist] = await pool.query('SELECT id FROM calificaciones WHERE id = ?', [id]);
    if (califExist.length === 0) {
      return res.status(404).json({
        status: 'error',
        mensaje: `No se encontró la calificación con ID ${id} para actualizar`
      });
    }

    // 2. Verificar existencia de la materia
    const [materiaRows] = await pool.query('SELECT id, nombre FROM materias WHERE id = ?', [materia_id]);
    if (materiaRows.length === 0) {
      return res.status(400).json({
        status: 'error',
        mensaje: `La materia con ID ${materia_id} no existe en el sistema`
      });
    }

    const alumnoLimpio = alumno.trim().replace(/\s+/g, ' ');
    const alumnoNorm = normalizarAlumno(alumno);

    // 3. Verificar que no exista otra calificación con la misma combinación alumno-materia
    const [otros] = await pool.query(
      'SELECT id, alumno FROM calificaciones WHERE materia_id = ? AND id != ?',
      [materia_id, id]
    );
    const yaRegistrado = otros.find((c) => normalizarAlumno(c.alumno) === alumnoNorm);

    if (yaRegistrado) {
      return res.status(409).json({
        status: 'error',
        mensaje: `No es posible actualizar: el alumno '${alumnoLimpio}' ya cuenta con un registro en la materia '${materiaRows[0].nombre}'.`
      });
    }

    const n1 = Number(Number(nota1).toFixed(2));
    const n2 = Number(Number(nota2).toFixed(2));
    const n3 = Number(Number(nota3).toFixed(2));

    await pool.query(
      'UPDATE calificaciones SET alumno = ?, materia_id = ?, nota1 = ?, nota2 = ?, nota3 = ? WHERE id = ?',
      [alumnoLimpio, materia_id, n1, n2, n3, id]
    );

    const calc = calcularDetalles(n1, n2, n3);

    return res.status(200).json({
      mensaje: 'Calificación actualizada exitosamente',
      calificacion: {
        id: Number(id),
        alumno: alumnoLimpio,
        materia_id: Number(materia_id),
        materia_nombre: materiaRows[0].nombre,
        notas: [n1, n2, n3],
        promedio: calc.promedio,
        condicion: calc.condicion
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Elimina una calificación por ID
 */
export async function deleteCalificacion(req, res, next) {
  try {
    const { id } = req.params;

    const [exist] = await pool.query('SELECT id FROM calificaciones WHERE id = ?', [id]);
    if (exist.length === 0) {
      return res.status(404).json({
        status: 'error',
        mensaje: `No se encontró la calificación con ID ${id} para eliminar`
      });
    }

    await pool.query('DELETE FROM calificaciones WHERE id = ?', [id]);

    return res.status(200).json({
      mensaje: 'Calificación eliminada exitosamente',
      id: Number(id)
    });
  } catch (error) {
    next(error);
  }
}
