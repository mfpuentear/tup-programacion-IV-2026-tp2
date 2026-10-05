import { Router } from 'express';
import { conexionBD } from '../db.js';
import { revisarErrores, validarFigura, validarId } from '../validators/validators.js';

const router = Router();


router.post('/', validarFigura, revisarErrores, async (req, res) => {
  const { medida_base, medida_altura } = req.body;
  
  const perimetro_calculado = (medida_base * 2) + (medida_altura * 2);
  const superficie_calculada = medida_base * medida_altura;

  try {
    const [resultado] = await conexionBD.query(
      'INSERT INTO tabla_rectangulos (medida_base, medida_altura, valor_perimetro, valor_superficie) VALUES (?, ?, ?, ?)',
      [medida_base, medida_altura, perimetro_calculado, superficie_calculada]
    );
    
    res.status(201).json({ 
      mensaje: 'Figura guardada con éxito',
      id: resultado.insertId,
      base: medida_base,
      altura: medida_altura,
      perimetro: perimetro_calculado,
      superficie: superficie_calculada
    });
  } catch (error) {
    console.error('Error en POST /:', error);
    res.status(500).json({ error: 'Hubo un error al guardar en la base de datos' });
  }
});

router.get('/', async (req, res) => {
  try {
    const [filas] = await conexionBD.query('SELECT * FROM tabla_rectangulos');
    res.json(filas);
  } catch (error) {
    console.error('Error en GET /:', error);
    res.status(500).json({ error: 'Error al consultar las figuras' });
  }
});

router.put('/:id', validarId, validarFigura, revisarErrores, async (req, res) => {
  const { id } = req.params;
  const { medida_base, medida_altura } = req.body;
  
  const perimetro_calculado = (medida_base * 2) + (medida_altura * 2);
  const superficie_calculada = medida_base * medida_altura;

  try {
    const [resultado] = await conexionBD.query(
      'UPDATE tabla_rectangulos SET medida_base = ?, medida_altura = ?, valor_perimetro = ?, valor_superficie = ? WHERE id_figura = ?',
      [medida_base, medida_altura, perimetro_calculado, superficie_calculada, id]
    );
    
    if (resultado.affectedRows === 0) {
      return res.status(404).json({ error: 'Rectángulo no encontrado' });
    }

    res.json({ 
      mensaje: 'Figura actualizada con éxito',
      id,
      base: medida_base,
      altura: medida_altura,
      perimetro: perimetro_calculado,
      superficie: superficie_calculada
    });
  } catch (error) {
    console.error('Error en PUT /:id:', error);
    res.status(500).json({ error: 'Error al actualizar en la base de datos' });
  }
});

router.delete('/:id', validarId, revisarErrores, async (req, res) => {
  const { id } = req.params;
  
  try {
    const [resultado] = await conexionBD.query(
      'DELETE FROM tabla_rectangulos WHERE id_figura = ?',
      [id]
    );
    
    if (resultado.affectedRows === 0) {
      return res.status(404).json({ error: 'Rectángulo no encontrado' });
    }

    res.json({ mensaje: 'Figura eliminada correctamente' });
  } catch (error) {
    console.error('Error en DELETE /:id:', error);
    res.status(500).json({ error: 'Error al eliminar en la base de datos' });
  }
});

export default router;