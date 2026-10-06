import express from 'express'
import mysql from 'mysql2/promise'
import { conectarDB, db } from './db.js'
import { validarDimensiones, validarId, verificarValidaciones } from './validaciones.js';
import { matchedData } from 'express-validator' // valores ya verificados

const app = express()
const port = 3000

app.use(express.json());
conectarDB();

const calcular = (ancho, alto) => ({
  perimetro: 2 * (ancho + alto),
  superficie: ancho * alto,
})

// Ver todo
app.get('/rectangulos', async (req, res) => {
    const [filas] = await db.execute(
      'SELECT id, ancho, alto, perimetro, superficie FROM rectangulos'
    )
    res.json(filas)
})

// Ver por id

app.get('/rectangulos/:id', validarId, verificarValidaciones, async (req, res) =>{

    const { id } = matchedData(req)
    const [filas] = await db.execute(
      'SELECT id, ancho, alto, perimetro, superficie FROM rectangulos WHERE id = ?',
      [id]
    )
    if (filas.length === 0) {
      return res.status(404).json({ mensaje: 'Rectángulo no encontrado' })
    }
    res.json(filas[0])
})


// Crear rectangulo

app.post('/rectangulos', validarDimensiones, verificarValidaciones, async (req, res)=>{

    const { ancho, alto } = matchedData(req) // son los datos ya verificados
    const { perimetro, superficie } = calcular(ancho, alto)
 
    const [resultado] = await db.execute(
      'INSERT INTO rectangulos (ancho, alto, perimetro, superficie) VALUES (?, ?, ?, ?)',
      [ancho, alto, perimetro, superficie]
    )
    res.status(201).json({ id: resultado.insertId, ancho, alto, perimetro, superficie })
})


// Modificar rectangulos por id

app.put(
  '/rectangulos/:id',
  validarId,
  validarDimensiones,
  verificarValidaciones,
  async (req, res) => {

    const { id, ancho, alto } = matchedData(req)
    const { perimetro, superficie } = calcular(ancho, alto)
 
    const [resultado] = await db.execute(
        'UPDATE rectangulos SET ancho = ?, alto = ?, perimetro = ?, superficie = ? WHERE id = ?',
        [ancho, alto, perimetro, superficie, id]
    )
    
    if (resultado.affectedRows === 0) { // Ver si se actualiza
        return res.status(404).json({ mensaje: 'Rectángulo no encontrado' })
    }
    res.json({ id, ancho, alto, perimetro, superficie })
  })

// Eliminar rectangulos por id

app.delete('/rectangulos/:id', validarId, verificarValidaciones, async (req, res) => {
    const { id } = matchedData(req)
    const [resultado] = await db.execute('DELETE FROM rectangulos WHERE id = ?', [id])
    if (resultado.affectedRows === 0) {
      return res.status(404).json({ mensaje: 'Rectángulo no encontrado' })
    }
    res.send("Rectangulo eliminado.")
    res.status(204)
})

app.listen(port, () => {
  console.log(`Servidor funcionando en ${port}`);
});