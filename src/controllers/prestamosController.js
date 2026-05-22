const Prestamo = require('../models/prestamos');
const db = require('../config/db_config');

class PrestamosController {
    static async getPrestamos(req, res) {
        try {
            const prestamos = await Prestamo.findAll();
            res.json(prestamos);
        } catch (error) {
            res.status(500).json({
                message: "Error al obtener préstamos",
                error: error.message
            });
        }
    }

    static async getPrestamoById(req, res) {
        try {
            const prestamo = await Prestamo.findById(req.params.id);
            res.json(prestamo);
        } catch (error) {
            res.status(500).json({
                message: "Error al obtener préstamo",
                error: error.message
            });
        }
    }

    static async createPrestamo(req, res) {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            let {
                monto,
                moneda,
                interes,
                meses,
                tipo_pago,
                fecha_inicio,
                id_cliente,
                id_inversor,
                id_asesor,
                status
            } = req.body;

            monto = parseFloat(monto);
            interes = parseFloat(interes);
            let rate = interes;
            if (rate > 1) {
                rate = rate / 100;
            }
            meses = parseInt(meses);
            tipo_pago = tipo_pago || 'mensual';
            moneda = moneda || 'pen';
            status = status || 'pending';
            
            // Calculate payments
            const montoInteres = monto * rate;
            let pago_mensual = montoInteres;
            if (tipo_pago === 'quincenal') {
                pago_mensual = montoInteres / 2;
            }

            // Total payment: Principal + (Interest * meses)
            const pago_total = monto + (montoInteres * meses);

            // Calculate end date
            let dateInicio = new Date(fecha_inicio || new Date());
            let dateFin = new Date(dateInicio);
            dateFin.setMonth(dateFin.getMonth() + meses);
            const fecha_fin = dateFin.toISOString().split('T')[0];

            // 1. Insert prestamo
            const [resultPrestamo] = await connection.execute(
                `INSERT INTO prestamos (monto, moneda, interes, meses, tipo_pago, pago_mensual, pago_total, status, fecha_inicio, fecha_fin, id_cliente, id_inversor, id_asesor, created_at, updated_at) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
                [
                    monto,
                    moneda,
                    interes,
                    meses,
                    tipo_pago,
                    pago_mensual,
                    pago_total,
                    status,
                    fecha_inicio || new Date().toISOString().split('T')[0],
                    fecha_fin,
                    id_cliente,
                    id_inversor,
                    id_asesor || 1
                ]
            );

            const id_prestamo = resultPrestamo.insertId;

            // 2. Generate and insert cuotas
            let num_cuotas = meses;
            if (tipo_pago === 'quincenal') {
                num_cuotas = meses * 2;
            }

            let tempDate = new Date(fecha_inicio || new Date());
            let saldoPendiente = monto;

            for (let i = 1; i <= num_cuotas; i++) {
                if (tipo_pago === 'quincenal') {
                    // Add 15 days
                    tempDate.setDate(tempDate.getDate() + 15);
                } else {
                    // Add 1 month
                    tempDate.setMonth(tempDate.getMonth() + 1);
                }

                let pagoCapital = 0;
                let montoCuota = pago_mensual;

                if (i === num_cuotas) {
                    pagoCapital = monto;
                    montoCuota = pago_mensual + monto;
                    saldoPendiente = 0;
                }

                await connection.execute(
                    `INSERT INTO cuotas (monto, fecha_vencimiento, status, pago_capital, pago_interes, saldo_pendiente, id_prestamo, created_at) 
                     VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
                    [
                        montoCuota,
                        tempDate.toISOString().split('T')[0],
                        'pendiente',
                        pagoCapital,
                        pago_mensual,
                        saldoPendiente,
                        id_prestamo
                    ]
                );
            }

            await connection.commit();

            res.json({
                message: "Préstamo creado y cuotas generadas exitosamente",
                id: id_prestamo
            });
        } catch (error) {
            await connection.rollback();
            res.status(500).json({
                message: "Error al crear préstamo",
                error: error.message
            });
        } finally {
            connection.release();
        }
    }

    static async updateStatus(req, res) {
        try {
            await Prestamo.updateStatus(req.params.id, req.body.status);
            res.json({
                message: "Estado del préstamo actualizado"
            });
        } catch (error) {
            res.status(500).json({
                message: "Error al actualizar préstamo",
                error: error.message
            });
        }
    }
}

module.exports = PrestamosController;
