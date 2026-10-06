import db from './db.js';

export const RectanguloModel = {

    async getAll() {
        const [rows] = await db.query('SELECT * FROM rectangulos');
        return rows;
    },

    async getById(id) {
        const [rows] = await db.query('SELECT * FROM rectangulos WHERE id = ?', [id]);
        return rows[0];
    },

    async create(lado1, lado2) {
        const l1 = parseFloat(lado1);
        const l2 = parseFloat(lado2);
        
        const perimetro = 2 * (l1 + l2);
        const superficie = l1 * l2;

        const [result] = await db.query(
            'INSERT INTO rectangulos (lado1, lado2, perimetro, superficie) VALUES (?, ?, ?, ?)',
            [l1, l2, perimetro, superficie]
        );

        return { id: result.insertId, lado1: l1, lado2: l2, perimetro, superficie };
    },

    async update(id, lado1, lado2) {
        const l1 = parseFloat(lado1);
        const l2 = parseFloat(lado2);

        const perimetro = 2 * (l1 + l2);
        const superficie = l1 * l2;

        const [result] = await db.query(
            'UPDATE rectangulos SET lado1 = ?, lado2 = ?, perimetro = ?, superficie = ? WHERE id = ?',
            [l1, l2, perimetro, superficie, id]
        );

        if (result.affectedRows === 0) return null;
        return { id, lado1: l1, lado2: l2, perimetro, superficie };
    },

    async delete(id) {
        const [result] = await db.query('DELETE FROM rectangulos WHERE id = ?', [id]);
        return result.affectedRows > 0;
    }
};