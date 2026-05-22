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

    static async create(cliente, asesor_id) {

        const [result] = await db.execute(
            "INSERT INTO clientes (nombre, dni, celular, correo, direccion, ocupacion, ingresos, creado_por, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())",
            [
                cliente.nombre,
                cliente.dni,
                cliente.celular,
                cliente.correo,
                cliente.direccion,
                cliente.ocupacion,
                cliente.ingresos,
                asesor_id
            ]
        );

        return result.insertId;
    }

    static async update(id, cliente) {
        await db.execute(
            "UPDATE clientes SET nombre = ?, dni = ?, celular = ?, correo = ?, direccion = ?, ocupacion = ?, ingresos = ?, updated_at = NOW() WHERE id = ?",
            [
                cliente.nombre,
                cliente.dni,
                cliente.celular,
                cliente.correo,
                cliente.direccion,
                cliente.ocupacion,
                cliente.ingresos,
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