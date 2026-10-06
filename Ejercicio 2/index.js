import express from 'express'
import { matchedData } from 'express-validator'
import { conectarDB, db } from './db.js'
import {
  validarCreacion,
  validarEstadoFiltro,
  validarId,
  validarModificacion,
  validarReemplazo,
  verificarValidaciones,
} from './validaciones.js' // valores ya verificados

const app = express()
const port = 3000

app.use(express.json());
conectarDB();

// en mysql, el booleano se guarda como 0 o 1, por lo tanto hay que convertirlo como true o false
const Tarea = (fila) => ({
  id: fila.id,
  nombre: fila.nombre,
  completada: Boolean(fila.completada)
})

const buscarTarea = async (id) => {
  const [filas] = await db.execute(
    'SELECT id, nombre, completada FROM tareas WHERE id = ?',
    [id]
  )
  return filas.length > 0 ? Tarea(filas[0]) : null
}

app.get('/tareas', validarEstadoFiltro, verificarValidaciones, async (req, res) => {
    const { estado } = matchedData(req)
 
    let sql = 'SELECT id, nombre, completada FROM tareas'
    const valores = []
    if (estado) {
      sql += ' WHERE completada = ?'
      valores.push(estado === 'completada' ? 1 : 0)
    }
    sql += ' ORDER BY id'
 
    const [filas] = await db.execute(sql, valores)
    res.json(filas.map(Tarea))
})


///


app.get('/tareas/:id', validarId, verificarValidaciones, async (req, res) => {
  try {
    const { id } = matchedData(req)
    const tarea = await buscarTarea(id)
    if (!tarea) return res.status(404).json({ mensaje: 'Tarea no encontrada' })
    res.json(tarea)
  } catch (e) {
    responderError(res, e)
  }
})


//

app.post('/tareas', validarCreacion, verificarValidaciones, async (req, res) => {
const { nombre, completada = false } = matchedData(req)
    const [resultado] = await db.execute(
      'INSERT INTO tareas (nombre, completada) VALUES (?, ?)',
      [nombre, completada ? 1 : 0]
    )
    res.status(201).json({ id: resultado.insertId, nombre, completada })
})

////


app.put(
  '/tareas/:id',
  validarId,
  validarReemplazo,
  verificarValidaciones,
  async (req, res) => {
    const { id, nombre, completada } = matchedData(req)
      const [resultado] = await db.execute(
        'UPDATE tareas SET nombre = ?, completada = ? WHERE id = ?',
        [nombre, completada ? 1 : 0, id]
      )
      if (resultado.affectedRows === 0) {
        return res.status(404).json({ mensaje: 'Tarea no encontrada' })
      }
      res.json({ id, nombre, completada })
  })

  /////


  app.patch(
  '/tareas/:id',
  validarId,
  validarModificacion,
  verificarValidaciones,
  async (req, res) => {
    const { id, nombre, completada } = matchedData(req)
    const campos = []
    const valores = []
    if (nombre !== undefined) {
      campos.push('nombre = ?')
      valores.push(nombre)
    }
    if (completada !== undefined) {
      campos.push('completada = ?')
      valores.push(completada ? 1 : 0)
    }

    const [resultado] = await db.execute(
      `UPDATE tareas SET ${campos.join(', ')} WHERE id = ?`,
      [...valores, id]
    )
    if (resultado.affectedRows === 0) {
      return res.status(404).json({ mensaje: 'Tarea no encontrada' })
    }
    res.json(await buscarTarea(id))

  })

  ///


  app.delete('/tareas/:id', validarId, verificarValidaciones, async (req, res) => {
    const { id } = matchedData(req)
    const [resultado] = await db.execute('DELETE FROM tareas WHERE id = ?', [id])
    if (resultado.affectedRows === 0) {
      return res.status(404).json({ mensaje: 'Tarea no encontrada' })
    }
    res.status(204).send()
})

//////



app.listen(port, () => {
  console.log(`Servidor funcionando en el puerto ${port}`)
  })