const db = require('../config/db_config');

class Cuotas {
    static async findAll() {
        const [rows] = await db.execute(
            "SELECT * FROM cuotas"
        );

        return rows;
    }

    static async findById(id) {
        const [rows] = await db.execute(
            "SELECT * FROM cuotas WHERE id = ?",
            [id]
        );

        return rows[0];
    }

    static async findByPrestamoId(id_prestamo) {
        const [rows] = await db.execute(
            "SELECT * FROM cuotas WHERE id_prestamo = ?",
            [id_prestamo]
        );

        return rows;
    }

    static async create(cuota) {
        const [result] = await db.execute(
            `INSERT INTO cuotas (monto, fecha_vencimiento, status, pago_capital, pago_interes, saldo_pendiente, id_prestamo, created_at) 
             VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
            [
                cuota.monto,
                cuota.fecha_vencimiento,
                cuota.status || 'pendiente',
                cuota.pago_capital || 0.00,
                cuota.pago_interes || 0.00,
                cuota.saldo_pendiente || 0.00,
                cuota.id_prestamo
            ]
        );

        return result.insertId;
    }

    static async update(id, cuota) {
        await db.execute(
            `UPDATE cuotas SET monto = ?, fecha_vencimiento = ?, status = ?, pago_capital = ?, pago_interes = ?, saldo_pendiente = ? 
             WHERE id = ?`,
            [
                cuota.monto,
                cuota.fecha_vencimiento,
                cuota.status,
                cuota.pago_capital,
                cuota.pago_interes,
                cuota.saldo_pendiente,
                id
            ]
        );
    }

    static async delete(id) {
        await db.execute(
            "DELETE FROM cuotas WHERE id = ?",
            [id]
        );
    }
}

module.exports = Cuotas;