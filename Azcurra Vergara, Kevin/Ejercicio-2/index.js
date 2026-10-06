import express from 'express'
import { pool } from './src/db.js'
import {
  manejarErrores,
  manejarConflicto,
  validarId,
  validarFiltro,
  validarTareaNueva,
  validarTareaCompleta,
  validarNombreUnico
} from './src/validators.js'
import { matchedData } from 'express-validator'

const app = express()
const PORT = 3000

app.use(express.json())

const aTarea = (fila) => ({
  id: fila.id,
  nombre: fila.nombre,
  completada: Boolean(fila.completada)
})

// GET /tareas
app.get('/tareas', validarFiltro, manejarErrores, async (req, res, next) => {
  try {
    const { completada } = matchedData(req)

    let consulta = 'SELECT id, nombre, completada FROM tareas'
    const valores = []

    if (completada !== undefined) {
      consulta += ' WHERE completada = ?'
      valores.push(completada)
    }

    const [filas] = await pool.query(
      `${consulta} ORDER BY id`,
      valores
    )

    res.json(filas.map(aTarea))
  } catch (error) {
    next(error)
  }
})

// GET /tareas/:id
app.get('/tareas/:id', validarId, manejarErrores, async (req, res, next) => {
  try {
    const { id } = matchedData(req)

    const [filas] = await pool.query(
      'SELECT id, nombre, completada FROM tareas WHERE id = ?',
      [id]
    )

    if (filas.length === 0) {
      res.status(404).json({
        error: 'Tarea no encontrada'
      })
      return
    }

    res.json(aTarea(filas[0]))
  } catch (error) {
    next(error)
  }
})

// POST /tareas
app.post(
  '/tareas',
  validarTareaNueva,
  manejarErrores,
  validarNombreUnico,
  manejarConflicto,
  async (req, res, next) => {
    try {
      const { nombre, completada = false } = matchedData(req)

      const [resultado] = await pool.query(
        'INSERT INTO tareas (nombre, completada) VALUES (?, ?)',
        [nombre, completada]
      )

      res.status(201).json(
        aTarea({
          id: resultado.insertId,
          nombre,
          completada
        })
      )
    } catch (error) {
      next(error)
    }
  }
)

// PUT /tareas/:id
app.put(
  '/tareas/:id',
  validarId,
  validarTareaCompleta,
  manejarErrores,
  validarNombreUnico,
  manejarConflicto,
  async (req, res, next) => {
    try {
      const { id, nombre, completada } = matchedData(req)

      const [resultado] = await pool.query(
        'UPDATE tareas SET nombre = ?, completada = ? WHERE id = ?',
        [nombre, completada, id]
      )

      if (resultado.affectedRows === 0) {
        res.status(404).json({
          error: 'Tarea no encontrada'
        })
        return
      }

      res.json(
        aTarea({
          id,
          nombre,
          completada
        })
      )
    } catch (error) {
      next(error)
    }
  }
)

// DELETE /tareas/:id
app.delete(
  '/tareas/:id',
  validarId,
  manejarErrores,
  async (req, res, next) => {
    try {
      const { id } = matchedData(req)

      const [resultado] = await pool.query(
        'DELETE FROM tareas WHERE id = ?',
        [id]
      )

      if (resultado.affectedRows === 0) {
        res.status(404).json({
          error: 'Tarea no encontrada'
        })
        return
      }

      res.json({
        message: 'Tarea eliminada'
      })
    } catch (error) {
      next(error)
    }
  }
)

// Ruta inexistente
app.use((_req, res) => {
  res.status(404).json({
    error: 'Ruta no encontrada'
  })
})

// Manejo de errores
app.use((error, _req, res, _next) => {
  if (error.type === 'entity.parse.failed') {
    res.status(400).json({
      error: 'El cuerpo no es un JSON válido'
    })
    return
  }

  if (error.code === 'ER_DUP_ENTRY') {
    res.status(409).json({
      error: 'Ya existe una tarea con ese nombre'
    })
    return
  }

  console.error('ERROR INTERNO:', error)

  res.status(500).json({
    error: 'Error interno del servidor',
    detalle: error.message
  })
})

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`)
})
