import { Router } from 'express';
import { conexionBD } from '../db.js';
import { revisarErrores, validarCalificacion, validarID } from '../validators/validators.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const consulta = `
      SELECT c.id_calificacion, c.nombre_alumno, m.nombre_materia, c.nota_1, c.nota_2, c.nota_3 
      FROM calificaciones c
      JOIN materias m ON c.id_materia = m.id_materia
    `;
    const [filas] = await conexionBD.query(consulta);
    res.json(filas);
  } catch (error) {
    res.status(500).json({ error: 'Error al consultar las calificaciones' });
  }
});

router.post('/', validarCalificacion, revisarErrores, async (req, res) => {
  const { nombre_alumno, id_materia, nota_1, nota_2, nota_3 } = req.body;
  try {
    const [resultado] = await conexionBD.query(
      'INSERT INTO calificaciones (nombre_alumno, id_materia, nota_1, nota_2, nota_3) VALUES (?, ?, ?, ?, ?)',
      [nombre_alumno, id_materia, nota_1, nota_2, nota_3]
    );
    res.status(201).json({ mensaje: 'Calificaciones registradas con éxito', id: resultado.insertId });
  } catch (error) {
    res.status(500).json({ error: 'Error al guardar las calificaciones' });
  }
});

router.put('/:id', validarID, validarCalificacion, revisarErrores, async (req, res) => {
  const { id } = req.params;
  const { nombre_alumno, id_materia, nota_1, nota_2, nota_3 } = req.body;
  try {
    const [resultado] = await conexionBD.query(
      'UPDATE calificaciones SET nombre_alumno = ?, id_materia = ?, nota_1 = ?, nota_2 = ?, nota_3 = ? WHERE id_calificacion = ?',
      [nombre_alumno, id_materia, nota_1, nota_2, nota_3, id]
    );
    if (resultado.affectedRows === 0) return res.status(404).json({ error: 'Registro no encontrado' });
    res.json({ mensaje: 'Calificaciones actualizadas' });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar las calificaciones' });
  }
});

router.delete('/:id', validarID, revisarErrores, async (req, res) => {
  const { id } = req.params;
  try {
    const [resultado] = await conexionBD.query('DELETE FROM calificaciones WHERE id_calificacion = ?', [id]);
    if (resultado.affectedRows === 0) return res.status(404).json({ error: 'Registro no encontrado' });
    res.json({ mensaje: 'Registro borrado correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar el registro' });
  }
});

export default router;