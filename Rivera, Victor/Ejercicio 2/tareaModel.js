import db from './db.js';

export const TareaModel = {
    async getAll(completada = null) {
        let query = 'SELECT * FROM tareas';
        const params = [];

        if (completada !== null) {
            query += ' WHERE completada = ?';
            params.push(completada);
        }

        const [rows] = await db.query(query, params);
        return rows;
    },

    async getById(id) {
        const [rows] = await db.query('SELECT * FROM tareas WHERE id = ?', [id]);
        return rows[0];
    },

    async findByNombre(nombre, excludeId = null) {
        let query = 'SELECT * FROM tareas WHERE LOWER(TRIM(nombre)) = LOWER(TRIM(?))';
        const params = [nombre];

        if (excludeId) {
            query += ' AND id != ?';
            params.push(excludeId);
        }

        const [rows] = await db.query(query, params);
        return rows[0];
    },

    async create(nombre, completada = false) {
        const [result] = await db.query(
            'INSERT INTO tareas (nombre, completada) VALUES (?, ?)',
            [nombre.trim(), completada]
        );
        return { id: result.insertId, nombre: nombre.trim(), completada };
    },

    async update(id, nombre, completada) {
        const [result] = await db.query(
            'UPDATE tareas SET nombre = ?, completada = ? WHERE id = ?',
            [nombre.trim(), completada, id]
        );
        if (result.affectedRows === 0) return null;
        return { id, nombre: nombre.trim(), completada };
    },

    async delete(id) {
        const [result] = await db.query('DELETE FROM tareas WHERE id = ?', [id]);
        return result.affectedRows > 0;
    }
};