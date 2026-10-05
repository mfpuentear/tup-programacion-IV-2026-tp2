import { pool } from '../config/db.js';

/**
 * Obtiene todos los rectángulos con soporte para filtros de consulta
 */
export async function getAllRectangles(req, res, next) {
  try {
    const { orden = 'asc', limite, esCuadrado } = req.query;

    let querySql = 'SELECT id, lado1, lado2, perimetro, superficie, fecha_creacion FROM rectangulos';
    const params = [];
    const conditions = [];

    if (esCuadrado !== undefined) {
      if (esCuadrado === 'true') {
        conditions.push('lado1 = lado2');
      } else if (esCuadrado === 'false') {
        conditions.push('lado1 != lado2');
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

    // Mapear los datos numéricos y agregar si es cuadrado como valor informativo
    const data = rows.map((r) => ({
      id: r.id,
      lado1: Number(r.lado1),
      lado2: Number(r.lado2),
      perimetro: Number(r.perimetro),
      superficie: Number(r.superficie),
      esCuadrado: Number(r.lado1) === Number(r.lado2),
      fecha_creacion: r.fecha_creacion
    }));

    return res.status(200).json(data);
  } catch (error) {
    next(error);
  }
}

/**
 * Obtiene un rectángulo por su ID
 */
export async function getRectangleById(req, res, next) {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(
      'SELECT id, lado1, lado2, perimetro, superficie, fecha_creacion FROM rectangulos WHERE id = ?',
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        mensaje: `No se encontró el rectángulo con ID ${id}`
      });
    }

    const r = rows[0];
    return res.status(200).json({
      id: r.id,
      lado1: Number(r.lado1),
      lado2: Number(r.lado2),
      perimetro: Number(r.perimetro),
      superficie: Number(r.superficie),
      esCuadrado: Number(r.lado1) === Number(r.lado2),
      fecha_creacion: r.fecha_creacion
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Crea un nuevo rectángulo.
 * El cliente solo envía lado1 y lado2. El servidor calcula perimetro y superficie.
 */
export async function createRectangle(req, res, next) {
  try {
    const { lado1, lado2 } = req.body;

    const nLado1 = Number(lado1);
    const nLado2 = Number(lado2);

    // Cálculo estricto en el servidor
    const perimetro = Number((2 * (nLado1 + nLado2)).toFixed(2));
    const superficie = Number((nLado1 * nLado2).toFixed(2));

    const [result] = await pool.query(
      'INSERT INTO rectangulos (lado1, lado2, perimetro, superficie) VALUES (?, ?, ?, ?)',
      [nLado1, nLado2, perimetro, superficie]
    );

    return res.status(201).json({
      mensaje: 'Rectángulo creado exitosamente',
      rectangulo: {
        id: result.insertId,
        lado1: nLado1,
        lado2: nLado2,
        perimetro,
        superficie,
        esCuadrado: nLado1 === nLado2
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Modifica un rectángulo existente.
 * El cliente solo envía lado1 y lado2. El servidor recalcula perimetro y superficie.
 */
export async function updateRectangle(req, res, next) {
  try {
    const { id } = req.params;
    const { lado1, lado2 } = req.body;

    // Verificar existencia previa
    const [exist] = await pool.query('SELECT id FROM rectangulos WHERE id = ?', [id]);
    if (exist.length === 0) {
      return res.status(404).json({
        status: 'error',
        mensaje: `No se encontró el rectángulo con ID ${id} para actualizar`
      });
    }

    const nLado1 = Number(lado1);
    const nLado2 = Number(lado2);

    // Recalcular perimetro y superficie en el servidor
    const perimetro = Number((2 * (nLado1 + nLado2)).toFixed(2));
    const superficie = Number((nLado1 * nLado2).toFixed(2));

    await pool.query(
      'UPDATE rectangulos SET lado1 = ?, lado2 = ?, perimetro = ?, superficie = ? WHERE id = ?',
      [nLado1, nLado2, perimetro, superficie, id]
    );

    return res.status(200).json({
      mensaje: 'Rectángulo actualizado exitosamente',
      rectangulo: {
        id: Number(id),
        lado1: nLado1,
        lado2: nLado2,
        perimetro,
        superficie,
        esCuadrado: nLado1 === nLado2
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Elimina un rectángulo por ID
 */
export async function deleteRectangle(req, res, next) {
  try {
    const { id } = req.params;

    const [exist] = await pool.query('SELECT id FROM rectangulos WHERE id = ?', [id]);
    if (exist.length === 0) {
      return res.status(404).json({
        status: 'error',
        mensaje: `No se encontró el rectángulo con ID ${id} para eliminar`
      });
    }

    await pool.query('DELETE FROM rectangulos WHERE id = ?', [id]);

    return res.status(200).json({
      mensaje: 'Rectángulo eliminado exitosamente',
      id: Number(id)
    });
  } catch (error) {
    next(error);
  }
}
