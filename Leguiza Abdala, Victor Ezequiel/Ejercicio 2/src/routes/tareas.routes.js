import { Router } from 'express';
import { conexionBD } from '../db.js';
import { revisarErrores, validarTarea, validarID, validarFiltro } from '../validators/validators.js';

const router = Router();

router.get('/', validarFiltro, revisarErrores, async (req, res) => {
  const { estado } = req.query;
  
  try {
    let consulta = 'SELECT * FROM tabla_tareas';
    let parametros = [];

    if (estado === 'completada') {
      consulta += ' WHERE esta_completada = true';
    } else if (estado === 'pendiente') {
      consulta += ' WHERE esta_completada = false';
    }

    const [filas] = await conexionBD.query(consulta, parametros);
    res.json(filas);
  } catch (error) {
    res.status(500).json({ error: 'Error al consultar las tareas' });
  }
});

router.post('/', validarTarea, revisarErrores, async (req, res) => {
  const { titulo_tarea, esta_completada = false } = req.body;
  
  try {
    const [resultado] = await conexionBD.query(
      'INSERT INTO tabla_tareas (titulo_tarea, esta_completada) VALUES (?, ?)',
      [titulo_tarea, esta_completada]
    );
    res.status(201).json({ 
      mensaje: 'Tarea creada con éxito', 
      id: resultado.insertId, 
      titulo_tarea, 
      esta_completada 
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al guardar la tarea' });
  }
});

router.put('/:id', validarID, validarTarea, revisarErrores, async (req, res) => {
  const { id } = req.params;
  const { titulo_tarea, esta_completada } = req.body;
  
  try {
    const [resultado] = await conexionBD.query(
      'UPDATE tabla_tareas SET titulo_tarea = ?, esta_completada = ? WHERE id_tarea = ?',
      [titulo_tarea, esta_completada, id]
    );
    if (resultado.affectedRows === 0) return res.status(404).json({ error: 'Tarea no encontrada' });
    
    res.json({ mensaje: 'Tarea actualizada', id, titulo_tarea, esta_completada });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar la tarea' });
  }
});

router.delete('/:id', validarID, revisarErrores, async (req, res) => {
  const { id } = req.params;
  try {
    const [resultado] = await conexionBD.query('DELETE FROM tabla_tareas WHERE id_tarea = ?', [id]);
    if (resultado.affectedRows === 0) return res.status(404).json({ error: 'Tarea no encontrada' });
    
    res.json({ mensaje: 'Tarea eliminada correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar la tarea' });
  }
});

export default router;