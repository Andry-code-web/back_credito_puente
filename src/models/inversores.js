const db = require("../config/db_config");

class Inversores {
    static async findAll() {
        const [rows] = await db.execute(
            "SELECT * FROM inversores"
        );
        return rows;
    }

    static async findById(id) {
        const [rows] = await db.execute(
            "SELECT * FROM inversores WHERE id = ?",
            [id]
        );
        return rows[0];
    }

    static async create(inversor, asesor_id) {
        const [result] = await db.execute(
            "INSERT INTO inversores (nombre, dni, celular, correo, direccion, monto, detalles, creado_por, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())",
            [
                inversor.nombre,
                inversor.dni,
                inversor.celular,
                inversor.correo,
                inversor.direccion,
                inversor.monto,
                inversor.detalles,
                asesor_id
            ]
        );
        return result.insertId;
    }

    static async update(id, inversor) {
        await db.execute(
            "UPDATE inversores SET nombre = ?, dni = ?, celular = ?, correo = ?, direccion = ?, monto = ?, detalles = ?, updated_at = NOW() WHERE id = ?",
            [
                inversor.nombre,
                inversor.dni,
                inversor.celular,
                inversor.correo,
                inversor.direccion,
                inversor.monto,
                inversor.detalles,
                id
            ]
        );
    }

    static async delete(id) {
        await db.execute(
            "DELETE FROM inversores WHERE id = ?",
            [id]
        );
    }
}

module.exports = Inversores;