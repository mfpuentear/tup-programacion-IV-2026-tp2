import express from 'express'
import { matchedData } from 'express-validator'
import { pool } from './src/db.js'

import {
  manejarErrores,
  manejarConflicto,
  validarId,
  validarMateriaNueva,
  validarCalificacionNueva,
  validarFiltro,
  validarMateriaExiste,
  validarCalificacionUnica,
  validarMateriaUnica
} from './src/validators.js'

const app = express()
const PORT = process.env.PORT || 3000

app.use(express.json())

// MATERIAS
app.get('/materias', async (req, res, next) => {
  try {
    const [filas] = await pool.query(
      'SELECT id, nombre FROM materias ORDER BY id'
    )

    res.json(filas)
  } catch (error) {
    next(error)
  }
})

app.get(
  '/materias/:id',
  validarId,
  manejarErrores,
  async (req, res, next) => {
    try {
      const { id } = matchedData(req)

      const [filas] = await pool.query(
        'SELECT id, nombre FROM materias WHERE id = ?',
        [id]
      )

      if (filas.length === 0) {
        return res.status(404).json({
          error: 'Materia no encontrada'
        })
      }

      res.json(filas[0])
    } catch (error) {
      next(error)
    }
  }
)

app.post(
  '/materias',
  validarMateriaNueva,
  manejarErrores,
  validarMateriaUnica,
  manejarConflicto,
  async (req, res, next) => {
    try {
      const { nombre } = matchedData(req)

      const [resultado] = await pool.query(
        'INSERT INTO materias (nombre) VALUES (?)',
        [nombre]
      )

      res.status(201).json({
        id: resultado.insertId,
        nombre
      })
    } catch (error) {
      next(error)
    }
  }
)

app.put(
  '/materias/:id',
  validarId,
  validarMateriaNueva,
  manejarErrores,
  validarMateriaUnica,
  manejarConflicto,
  async (req, res, next) => {
    try {
      const { id, nombre } = matchedData(req)

      const [resultado] = await pool.query(
        'UPDATE materias SET nombre = ? WHERE id = ?',
        [nombre, id]
      )

      if (resultado.affectedRows === 0) {
        return res.status(404).json({
          error: 'Materia no encontrada'
        })
      }

      res.json({
        id,
        nombre
      })
    } catch (error) {
      next(error)
    }
  }
)

app.delete(
  '/materias/:id',
  validarId,
  manejarErrores,
  async (req, res, next) => {
    try {
      const { id } = matchedData(req)

      const [resultado] = await pool.query(
        'DELETE FROM materias WHERE id = ?',
        [id]
      )

      if (resultado.affectedRows === 0) {
        return res.status(404).json({
          error: 'Materia no encontrada'
        })
      }

      res.json({
        message: 'Materia eliminada'
      })
    } catch (error) {
      if (error.code === 'ER_ROW_IS_REFERENCED_2') {
        return res.status(409).json({
          error: 'No se puede eliminar la materia porque tiene calificaciones asociadas'
        })
      }

      next(error)
    }
  }
)

// CALIFICACIONES
app.get(
  '/calificaciones',
  validarFiltro,
  manejarErrores,
  async (req, res, next) => {
    try {
      const datos = matchedData(req)

      let consulta = `
        SELECT
          c.id,
          c.alumno,
          c.materia_id,
          m.nombre AS materia,
          c.nota1,
          c.nota2,
          c.nota3
        FROM calificaciones c
        INNER JOIN materias m ON c.materia_id = m.id
      `

      const condiciones = []
      const valores = []

      if (datos.alumno !== undefined) {
        condiciones.push('LOWER(c.alumno) = LOWER(?)')
        valores.push(datos.alumno)
      }

      if (datos.materia_id !== undefined) {
        condiciones.push('c.materia_id = ?')
        valores.push(datos.materia_id)
      }

      if (condiciones.length > 0) {
        consulta += ' WHERE ' + condiciones.join(' AND ')
      }

      consulta += ' ORDER BY c.id'

      const [filas] = await pool.query(consulta, valores)

      res.json(filas)
    } catch (error) {
      next(error)
    }
  }
)

app.get(
  '/calificaciones/:id',
  validarId,
  manejarErrores,
  async (req, res, next) => {
    try {
      const { id } = matchedData(req)

      const [filas] = await pool.query(
        `
        SELECT
          c.id,
          c.alumno,
          c.materia_id,
          m.nombre AS materia,
          c.nota1,
          c.nota2,
          c.nota3
        FROM calificaciones c
        INNER JOIN materias m ON c.materia_id = m.id
        WHERE c.id = ?
        `,
        [id]
      )

      if (filas.length === 0) {
        return res.status(404).json({
          error: 'Calificación no encontrada'
        })
      }

      res.json(filas[0])
    } catch (error) {
      next(error)
    }
  }
)

app.post(
  '/calificaciones',
  validarCalificacionNueva,
  manejarErrores,
  validarMateriaExiste,
  validarCalificacionUnica,
  manejarConflicto,
  async (req, res, next) => {
    try {
      const {
        alumno,
        materia_id,
        nota1,
        nota2,
        nota3
      } = matchedData(req)

      const [resultado] = await pool.query(
        `
        INSERT INTO calificaciones
        (alumno, materia_id, nota1, nota2, nota3)
        VALUES (?, ?, ?, ?, ?)
        `,
        [alumno, materia_id, nota1, nota2, nota3]
      )

      res.status(201).json({
        id: resultado.insertId,
        alumno,
        materia_id,
        nota1,
        nota2,
        nota3
      })
    } catch (error) {
      next(error)
    }
  }
)

app.put(
  '/calificaciones/:id',
  validarId,
  validarCalificacionNueva,
  manejarErrores,
  validarMateriaExiste,
  validarCalificacionUnica,
  manejarConflicto,
  async (req, res, next) => {
    try {
      const {
        id,
        alumno,
        materia_id,
        nota1,
        nota2,
        nota3
      } = matchedData(req)

      const [resultado] = await pool.query(
        `
        UPDATE calificaciones
        SET alumno = ?, materia_id = ?, nota1 = ?, nota2 = ?, nota3 = ?
        WHERE id = ?
        `,
        [alumno, materia_id, nota1, nota2, nota3, id]
      )

      if (resultado.affectedRows === 0) {
        return res.status(404).json({
          error: 'Calificación no encontrada'
        })
      }

      res.json({
        id,
        alumno,
        materia_id,
        nota1,
        nota2,
        nota3
      })
    } catch (error) {
      next(error)
    }
  }
)

app.delete(
  '/calificaciones/:id',
  validarId,
  manejarErrores,
  async (req, res, next) => {
    try {
      const { id } = matchedData(req)

      const [resultado] = await pool.query(
        'DELETE FROM calificaciones WHERE id = ?',
        [id]
      )

      if (resultado.affectedRows === 0) {
        return res.status(404).json({
          error: 'Calificación no encontrada'
        })
      }

      res.json({
        message: 'Calificación eliminada'
      })
    } catch (error) {
      next(error)
    }
  }
)

// RUTAS Y ERRORES
app.use((_req, res) => {
  res.status(404).json({
    error: 'Ruta no encontrada'
  })
})

app.use((error, _req, res, _next) => {
  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({
      error: 'El cuerpo no es un JSON válido'
    })
  }

  if (error.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({
      error: 'Ya existe un registro con esos datos'
    })
  }

  console.error('Error interno:', error)

  res.status(500).json({
    error: 'Error interno del servidor'
  })
})

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`)
})