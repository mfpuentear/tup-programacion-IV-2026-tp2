import express from 'express';
import mysql from 'mysql2/promise';
import { body, param, validationResult } from 'express-validator';
const app = express();
app.use(express.json());

// Configuración de la conexión a MySQL
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '12345',
  database: 'tp2_ejercicio1',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Función auxiliar para verificar errores de validación
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errores: errors.array() });
  }
  next();
};

// ==========================================
// RUTAS PARA MANEJAR LOS RECTÁNGULOS
// ==========================================

// Traer la lista con todos los rectángulos
app.get('/api/rectangulos', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM rectangulos');
    res.json(rows);
  } catch (error) {
    console.log('--- ERROR EXACTO DE MYSQL ---', error);
    res.status(500).json({ error: 'Hubo un problema al intentar consultar los datos' });
  }
});

// Buscar un rectángulo en particular por ID
app.get(
  '/api/rectangulos/:id',
  [
    param('id')
      .isInt({ min: 1 })
      .withMessage('El ID recibido tiene que ser un número entero mayor a 0')
  ],
  handleValidationErrors,
  async (req, res) => {
    const { id } = req.params;
    try {
      const [rows] = await pool.query('SELECT * FROM rectangulos WHERE id = ?', [id]);
      if (rows.length === 0) {
        return res.status(404).json({ error: 'No se encontró ningún rectángulo con ese ID' });
      }
      res.json(rows[0]);
    } catch (error) {
      console.log('--- ERROR EXACTO DE MYSQL ---', error);
      res.status(500).json({ error: 'Hubo un problema al intentar consultar los datos' });
    }
  }
);

// Guardar un nuevo rectángulo
app.post(
  '/api/rectangulos',
  [
    body('lado_a')
      .exists().withMessage('Tenés que enviar el campo lado_a')
      .isFloat({ gt: 0 }).withMessage('El lado_a debe ser un número positivo mayor a 0'),
    body('lado_b')
      .exists().withMessage('Tenés que enviar el campo lado_b')
      .isFloat({ gt: 0 }).withMessage('El lado_b debe ser un número positivo mayor a 0')
  ],
  handleValidationErrors,
  async (req, res) => {
    const lado_a = parseFloat(req.body.lado_a);
    const lado_b = parseFloat(req.body.lado_b);

    // Los cálculos se hacen acá en el backend antes de guardar
    const perimetro = 2 * (lado_a + lado_b);
    const superficie = lado_a * lado_b;

    try {
      const [result] = await pool.query(
        'INSERT INTO rectangulos (lado_a, lado_b, perimetro, superficie) VALUES (?, ?, ?, ?)',
        [lado_a, lado_b, perimetro, superficie]
      );
      res.status(201).json({
        id: result.insertId,
        lado_a,
        lado_b,
        perimetro,
        superficie
      });
    } catch (error) {
      console.log('--- ERROR EXACTO DE MYSQL ---', error);
      res.status(500).json({ error: 'No se pudo guardar la información en la base de datos' });
    }
  }
);

// Modificar los datos de un rectángulo
app.put(
  '/api/rectangulos/:id',
  [
    param('id')
      .isInt({ min: 1 })
      .withMessage('El ID debe ser un número entero mayor a 0'),
    body('lado_a')
      .exists().withMessage('Tenés que enviar el campo lado_a')
      .isFloat({ gt: 0 }).withMessage('El lado_a debe ser un número positivo mayor a 0'),
    body('lado_b')
      .exists().withMessage('Tenés que enviar el campo lado_b')
      .isFloat({ gt: 0 }).withMessage('El lado_b debe ser un número positivo mayor a 0')
  ],
  handleValidationErrors,
  async (req, res) => {
    const { id } = req.params;
    const lado_a = parseFloat(req.body.lado_a);
    const lado_b = parseFloat(req.body.lado_b);

    // Recalculamos los valores con los nuevos lados enviados
    const perimetro = 2 * (lado_a + lado_b);
    const superficie = lado_a * lado_b;

    try {
      const [result] = await pool.query(
        'UPDATE rectangulos SET lado_a = ?, lado_b = ?, perimetro = ?, superficie = ? WHERE id = ?',
        [lado_a, lado_b, perimetro, superficie, id]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'No se encontró el rectángulo que querés modificar' });
      }

      res.json({ id: Number(id), lado_a, lado_b, perimetro, superficie });
    } catch (error) {
      console.log('--- ERROR EXACTO DE MYSQL ---', error);
      res.status(500).json({ error: 'Error al actualizar el registro en la base de datos' });
    }
  }
);

// Eliminar un rectángulo
app.delete(
  '/api/rectangulos/:id',
  [
    param('id')
      .isInt({ min: 1 })
      .withMessage('El ID debe ser un número entero mayor a 0')
  ],
  handleValidationErrors,
  async (req, res) => {
    const { id } = req.params;
    try {
      const [result] = await pool.query('DELETE FROM rectangulos WHERE id = ?', [id]);

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'No existe ningún rectángulo con ese ID para borrar' });
      }

      res.json({ mensaje: 'Rectángulo eliminado con éxito' });
    } catch (error) {
      console.log('--- ERROR EXACTO DE MYSQL ---', error);
      res.status(500).json({ error: 'Error al intentar eliminar el registro' });
    }
  }
);

// Arrancamos el servidor
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor levantado y escuchando en http://localhost:${PORT}`);
});