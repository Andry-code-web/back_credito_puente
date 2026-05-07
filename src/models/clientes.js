const db = require('../config/db_config');

class Cliente {

    static async getAll() {
        const [rows] = await db.execute(
            "SELECT * FROM clientes"
        );

        return rows;
    }

    static async getById(id) {
        const [rows] = await db.execute(
            "SELECT * FROM clientes WHERE id = ?",
            [id]
        );

        return rows[0];
    }

    static async create(cliente) {

        const [result] = await db.execute(
            "INSERT INTO clientes (nombre, dni, celular, correo, direccion, created_at) VALUES (?, ?, ?, ?, ?, NOW())",
            [
                cliente.nombre,
                cliente.dni,
                cliente.celular,
                cliente.correo,
                cliente.direccion
            ]
        );

        return result.insertId;
    }

    static async update(id, cliente) {
        await db.execute(
            "UPDATE clientes SET nombre = ?, dni = ?, celular = ?, correo = ?, direccion = ?, updated_at = NOW() WHERE id = ?",
            [
                cliente.nombre,
                cliente.dni,
                cliente.celular,
                cliente.correo,
                cliente.direccion,
                id
            ]
        );
    }

    static async delete(id) {
        await db.execute(
            "DELETE FROM clientes WHERE id = ?",
            [id]
        );
    }
}

module.exports = Cliente;