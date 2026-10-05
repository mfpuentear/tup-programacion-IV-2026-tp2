const db = require('../db');

// Obtener todos los rectángulos
const obtenerTodos = async (req, res) => {
    try {
        const [filas] = await db.query('SELECT * FROM rectangulos');
        res.json(filas);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener los rectángulos de la base de datos.' });
    }
};

// Crear un nuevo rectángulo
const crear = async (req, res) => {
    try {
        //Extraemos solo los lados (ya validados por express-validator)
        const base = parseFloat(req.body.base);
        const altura = parseFloat(req.body.altura);
        
        //Cálculos obligatorios en el servidor
        const perimetro = 2 * (base + altura);
        const superficie = base * altura;

        //Guardar en MySQL
        const [resultado] = await db.query(
            'INSERT INTO rectangulos (base, altura, perimetro, superficie) VALUES (?, ?, ?, ?)',
            [base, altura, perimetro, superficie]
        );
        
        //Responder con el registro completo
        res.status(201).json({ 
            id: resultado.insertId, 
            base, 
            altura, 
            perimetro, 
            superficie 
        });
    } catch (error) {
        res.status(500).json({ error: 'Error al guardar el rectángulo.' });
    }
};

// Modificar un rectángulo existente
const actualizar = async (req, res) => {
    try {
        const { id } = req.params;
        const base = parseFloat(req.body.base);
        const altura = parseFloat(req.body.altura);
        
        const perimetro = 2 * (base + altura);
        const superficie = base * altura;

        const [resultado] = await db.query(
            'UPDATE rectangulos SET base = ?, altura = ?, perimetro = ?, superficie = ? WHERE id = ?',
            [base, altura, perimetro, superficie, id]
        );

        if (resultado.affectedRows === 0) {
            return res.status(404).json({ error: 'Rectángulo no encontrado.' });
        }
        
        res.json({ 
            id: parseInt(id), 
            base, 
            altura, 
            perimetro, 
            superficie 
        });
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar el rectángulo.' });
    }
};

// Eliminar un rectángulo
const eliminar = async (req, res) => {
    try {
        const { id } = req.params;
        const [resultado] = await db.query('DELETE FROM rectangulos WHERE id = ?', [id]);
        
        if (resultado.affectedRows === 0) {
            return res.status(404).json({ error: 'Rectángulo no encontrado.' });
        }
        
        res.json({ mensaje: 'Rectángulo eliminado correctamente.' });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar el rectángulo.' });
    }
};

module.exports = { obtenerTodos, crear, actualizar, eliminar };