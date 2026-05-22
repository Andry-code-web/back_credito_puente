const db = require('../config/db_config');

class Prestamo {
    static async findAll() {
        const [rows] = await db.execute("SELECT * FROM prestamos");
        return rows;
    }

    static async findById(id) {
        const [rows] = await db.execute("SELECT * FROM prestamos WHERE id = ?", [id]);
        return rows[0];
    }

    static async create(prestamo) {
        const [result] = await db.execute(
            `INSERT INTO prestamos (monto, moneda, interes, meses, tipo_pago, pago_mensual, pago_total, status, fecha_inicio, fecha_fin, id_cliente, id_inversor, id_asesor, created_at, updated_at) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
            [
                prestamo.monto,
                prestamo.moneda || 'pen',
                prestamo.interes,
                prestamo.meses,
                prestamo.tipo_pago || 'mensual',
                prestamo.pago_mensual,
                prestamo.pago_total,
                prestamo.status || 'pending',
                prestamo.fecha_inicio,
                prestamo.fecha_fin,
                prestamo.id_cliente,
                prestamo.id_inversor,
                prestamo.id_asesor
            ]
        );
        return result.insertId;
    }

    static async updateStatus(id, status) {
        await db.execute("UPDATE prestamos SET status = ?, updated_at = NOW() WHERE id = ?", [status, id]);
    }
}

module.exports = Prestamo;
