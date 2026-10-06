import express from 'express'
import { matchedData } from 'express-validator'
import { conectarDB, db } from './db.js'
import {
  validarCalificacion,
  validarFiltro,
  validarId,
  validarMateria,
  verificarValidaciones,
} from './validaciones.js'

const app = express()
const port = 3000

app.use(express.json());
conectarDB();


const responderError = (res, e) => {
  if (e.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({ mensaje: 'Ya existe un registro con esos datos' })
  }
  console.error(e)
  res.status(500).json({ mensaje: 'Error interno del servidor' })
}


const consultaCalificaciones = `
  SELECT c.id, c.alumno, c.materia_id, m.nombre AS materia, c.nota1, c.nota2, c.nota3
  FROM calificaciones c
  JOIN materias m ON m.id = c.materia_id`


app.get('/materias', async (req, res) => {
  try {
    const [filas] = await db.execute('SELECT id, nombre FROM materias')
    res.json(filas)
  } catch (e) {
    responderError(res, e)
  }
})


app.get('/calificaciones', validarFiltro, verificarValidaciones, async (req, res) => {
  try {
    const { materia_id } = matchedData(req)
 
    let sql = consultaCalificaciones
    const valores = []
    if (materia_id !== undefined) {
      sql += ' WHERE c.materia_id = ?'
      valores.push(materia_id)
    }
 
    const [filas] = await db.execute(sql, valores)
    res.json(filas)
  } catch (e) {
    responderError(res, e)
  }
})


app.get('/calificaciones/:id', validarId, verificarValidaciones, async (req, res) => {
  try {
    const { id } = matchedData(req)
    const [filas] = await db.execute(`${consultaCalificaciones} WHERE c.id = ?`, [id])
    if (filas.length === 0) {
      return res.status(404).json({ mensaje: 'Calificación no encontrada' })
    }
    res.json(filas[0])
  } catch (e) {
    responderError(res, e)
  }
})



app.post('/materias', validarMateria, verificarValidaciones, async (req, res) => {
  try {
    const { nombre } = matchedData(req)
    const [resultado] = await db.execute('INSERT INTO materias (nombre) VALUES (?)', [nombre])
    res.status(201).json({ id: resultado.insertId, nombre })
  } catch (e) {
    responderError(res, e)
  }
})


app.post('/calificaciones', validarCalificacion, verificarValidaciones, async (req, res) => {
  try {
    const { alumno, materia_id, nota1, nota2, nota3 } = matchedData(req)
    const [resultado] = await db.execute(
      'INSERT INTO calificaciones (alumno, materia_id, nota1, nota2, nota3) VALUES (?, ?, ?, ?, ?)',
      [alumno, materia_id, nota1, nota2, nota3]
    )
    res.status(201).json({ id: resultado.insertId, alumno, materia_id, nota1, nota2, nota3 })
  } catch (e) {
    responderError(res, e)
  }
})


app.put(
  '/calificaciones/:id',
  validarId,
  validarCalificacion,
  verificarValidaciones,
  async (req, res) => {
    try {
      const { id, alumno, materia_id, nota1, nota2, nota3 } = matchedData(req)
      const [resultado] = await db.execute(
        `UPDATE calificaciones
         SET alumno = ?, materia_id = ?, nota1 = ?, nota2 = ?, nota3 = ?
         WHERE id = ?`,
        [alumno, materia_id, nota1, nota2, nota3, id]
      )
      if (resultado.affectedRows === 0) {
        return res.status(404).json({ mensaje: 'Calificación no encontrada' })
      }
      res.json({ id, alumno, materia_id, nota1, nota2, nota3 })
    } catch (e) {
      responderError(res, e)
    }
  }
)


app.delete('/calificaciones/:id', validarId, verificarValidaciones, async (req, res) => {
  try {
    const { id } = matchedData(req)
    const [resultado] = await db.execute('DELETE FROM calificaciones WHERE id = ?', [id])
    if (resultado.affectedRows === 0) {
      return res.status(404).json({ mensaje: 'Calificación no encontrada' })
    }
    res.status(204).send()
  } catch (e) {
    responderError(res, e)
  }
})





//////

app.listen(port, () => {
  console.log(`Servidor funcionando en el puerto ${port}`)
  })
