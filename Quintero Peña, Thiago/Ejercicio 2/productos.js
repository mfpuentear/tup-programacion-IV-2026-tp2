import express from 'express';
import { query, run } from './db.js';
import { validarProducto } from './validaciones.js';

const router = express.Router();

// GET /api/productos - Obtener todos
router.get('/', async (req, res) => {
  try {
    const rows = await query('SELECT * FROM productos');
    res.json(rows);
  } catch (error) {
    console.error(' Error al consultar productos:', error);
    res.status(500).json({ error: 'Error al consultar productos' });
  }
});

// GET /api/productos/:id - Obtener por ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const rows = await query('SELECT * FROM productos WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error(` Error al consultar producto ID ${id}:`, error);
    res.status(500).json({ error: 'Error al consultar el producto' });
  }
});

// POST /api/productos - Crear producto
router.post('/', async (req, res) => {
  const { error, value } = validarProducto(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  const { nombre, precio, stock } = value;

  try {
    const result = await run(
      'INSERT INTO productos (nombre, precio, stock) VALUES (?, ?, ?)',
      [nombre, precio, stock]
    );
    res.status(201).json({
      id: result.id,
      nombre,
      precio,
      stock
    });
  } catch (error) {
    console.error(' Error al crear producto:', error);
    res.status(500).json({ error: 'Error al crear producto' });
  }
});

// PUT /api/productos/:id - Actualizar producto
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { error, value } = validarProducto(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  const { nombre, precio, stock } = value;

  try {
    const result = await run(
      'UPDATE productos SET nombre = ?, precio = ?, stock = ? WHERE id = ?',
      [nombre, precio, stock, id]
    );

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    res.json({ id: Number(id), nombre, precio, stock });
  } catch (error) {
    console.error(` Error al actualizar producto ID ${id}:`, error);
    res.status(500).json({ error: 'Error al actualizar el producto' });
  }
});

// DELETE /api/productos/:id - Eliminar producto
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await run('DELETE FROM productos WHERE id = ?', [id]);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    res.json({ mensaje: 'Producto eliminado correctamente', id: Number(id) });
  } catch (error) {
    console.error(` Error al eliminar producto ID ${id}:`, error);
    res.status(500).json({ error: 'Error al eliminar el producto' });
  }
});

export default router;