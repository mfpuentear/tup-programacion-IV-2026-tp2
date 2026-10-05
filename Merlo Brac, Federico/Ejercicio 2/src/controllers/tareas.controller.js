import { pool } from '../config/db.js';

/**
 * Normaliza un nombre de tarea aplicando el criterio consistente:
 * 1. Remueve espacios al inicio y al final.
 * 2. Reemplaza secuencias de múltiples espacios contiguos por un único espacio.
 * 3. Convierte a minúsculas para comparación case-insensitive.
 */
export function normalizarNombre(nombre) {
  if (typeof nombre !== 'string') return '';
  return nombre.trim().replace(/\s+/g, ' ').toLowerCase();
}

/**
 * Obtiene el listado de tareas con soporte para filtrado por estado
 */
export async function getAllTasks(req, res, next) {
  try {
    const { estado, orden = 'asc', limite } = req.query;

    let querySql = 'SELECT id, nombre, estado, fecha_creacion FROM tareas';
    const params = [];
    const conditions = [];

    if (estado !== undefined && estado !== 'todas') {
      if (estado === 'completadas' || estado === 'true' || estado === '1') {
        conditions.push('estado = TRUE');
      } else if (estado === 'pendientes' || estado === 'false' || estado === '0') {
        conditions.push('estado = FALSE');
      }
    }

    if (conditions.length > 0) {
      querySql += ' WHERE ' + conditions.join(' AND ');
    }

    const direction = orden.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
    querySql += ` ORDER BY id ${direction}`;

    if (limite) {
      querySql += ' LIMIT ?';
      params.push(Number(limite));
    }

    const [rows] = await pool.query(querySql, params);

    const tareas = rows.map((r) => ({
      id: r.id,
      nombre: r.nombre,
      estado: Boolean(r.estado),
      fecha_creacion: r.fecha_creacion
    }));

    return res.status(200).json(tareas);
  } catch (error) {
    next(error);
  }
}

/**
 * Obtiene una tarea por su ID
 */
export async function getTaskById(req, res, next) {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(
      'SELECT id, nombre, estado, fecha_creacion FROM tareas WHERE id = ?',
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        mensaje: `No se encontró la tarea con ID ${id}`
      });
    }

    const r = rows[0];
    return res.status(200).json({
      id: r.id,
      nombre: r.nombre,
      estado: Boolean(r.estado),
      fecha_creacion: r.fecha_creacion
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Crea una nueva tarea aplicando la regla de unicidad de nombre
 */
export async function createTask(req, res, next) {
  try {
    const { nombre, estado = false } = req.body;
    const nombreLimpio = nombre.trim().replace(/\s+/g, ' ');
    const nombreNorm = normalizarNombre(nombre);

    // Verificar unicidad con criterio consistente
    const [existentes] = await pool.query('SELECT id, nombre FROM tareas');
    const duplicada = existentes.find((t) => normalizarNombre(t.nombre) === nombreNorm);

    if (duplicada) {
      return res.status(409).json({
        status: 'error',
        mensaje: `Ya existe una tarea con el nombre '${duplicada.nombre}'. No se permiten nombres duplicados (criterio: insensible a mayúsculas y espacios superfluos).`,
        tareaExistente: duplicada
      });
    }

    const estadoBool = Boolean(estado);
    const [result] = await pool.query(
      'INSERT INTO tareas (nombre, estado) VALUES (?, ?)',
      [nombreLimpio, estadoBool]
    );

    return res.status(201).json({
      mensaje: 'Tarea creada exitosamente',
      tarea: {
        id: result.insertId,
        nombre: nombreLimpio,
        estado: estadoBool
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Modifica una tarea existente (nombre y estado) aplicando la regla de unicidad
 */
export async function updateTask(req, res, next) {
  try {
    const { id } = req.params;
    const { nombre, estado } = req.body;

    const [exist] = await pool.query('SELECT id FROM tareas WHERE id = ?', [id]);
    if (exist.length === 0) {
      return res.status(404).json({
        status: 'error',
        mensaje: `No se encontró la tarea con ID ${id} para actualizar`
      });
    }

    const nombreLimpio = nombre.trim().replace(/\s+/g, ' ');
    const nombreNorm = normalizarNombre(nombre);

    // Verificar que no coincida con el nombre de otra tarea distinta
    const [existentes] = await pool.query('SELECT id, nombre FROM tareas WHERE id != ?', [id]);
    const duplicada = existentes.find((t) => normalizarNombre(t.nombre) === nombreNorm);

    if (duplicada) {
      return res.status(409).json({
        status: 'error',
        mensaje: `No se puede actualizar: ya existe otra tarea con el nombre '${duplicada.nombre}'.`,
        tareaExistente: duplicada
      });
    }

    const estadoBool = Boolean(estado);
    await pool.query(
      'UPDATE tareas SET nombre = ?, estado = ? WHERE id = ?',
      [nombreLimpio, estadoBool, id]
    );

    return res.status(200).json({
      mensaje: 'Tarea actualizada exitosamente',
      tarea: {
        id: Number(id),
        nombre: nombreLimpio,
        estado: estadoBool
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Modifica únicamente el estado de la tarea (PATCH /api/tareas/:id/estado)
 */
export async function patchTaskStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    const [exist] = await pool.query('SELECT id, nombre FROM tareas WHERE id = ?', [id]);
    if (exist.length === 0) {
      return res.status(404).json({
        status: 'error',
        mensaje: `No se encontró la tarea con ID ${id} para actualizar su estado`
      });
    }

    const estadoBool = Boolean(estado);
    await pool.query('UPDATE tareas SET estado = ? WHERE id = ?', [estadoBool, id]);

    return res.status(200).json({
      mensaje: 'Estado de la tarea actualizado exitosamente',
      tarea: {
        id: Number(id),
        nombre: exist[0].nombre,
        estado: estadoBool
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Elimina una tarea por su ID
 */
export async function deleteTask(req, res, next) {
  try {
    const { id } = req.params;

    const [exist] = await pool.query('SELECT id FROM tareas WHERE id = ?', [id]);
    if (exist.length === 0) {
      return res.status(404).json({
        status: 'error',
        mensaje: `No se encontró la tarea con ID ${id} para eliminar`
      });
    }

    await pool.query('DELETE FROM tareas WHERE id = ?', [id]);

    return res.status(200).json({
      mensaje: 'Tarea eliminada exitosamente',
      id: Number(id)
    });
  } catch (error) {
    next(error);
  }
}
