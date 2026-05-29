const Prestamo = require('../models/prestamos');
const Cliente = require('../models/clientes');
const Cuotas = require('../models/cuotas');
const User = require('../models/users');
const Inversores = require('../models/inversores');
const db = require('../config/db_config');
const { generateLoanPDF } = require('../utils/pdfGenerator');


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

    static async generatePDF(req, res) {
        try {
            const { id } = req.params;
            
            // 1. Fetch loan
            const loan = await Prestamo.findById(id);
            if (!loan) {
                return res.status(404).json({ message: "Préstamo no encontrado" });
            }

            // 2. Fetch associated info
            const [client, advisor, investor, cuotas] = await Promise.all([
                loan.id_cliente ? Cliente.getById(loan.id_cliente) : Promise.resolve(null),
                loan.id_asesor ? User.findById(loan.id_asesor) : Promise.resolve(null),
                loan.id_inversor ? Inversores.findById(loan.id_inversor) : Promise.resolve(null),
                Cuotas.findByPrestamoId(id)
            ]);

            // 3. Set headers for inline PDF rendering
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `inline; filename="Prestamo_PR-${String(id).padStart(6, '0')}.pdf"`);

            // 4. Generate PDF stream
            generateLoanPDF(loan, client, advisor, investor, cuotas, res);

        } catch (error) {
            res.status(500).json({
                message: "Error al generar el PDF del préstamo",
                error: error.message
            });
        }
    }

    static async generateSimulationPDF(req, res) {
        try {
            const {
                monto,
                moneda,
                interes,
                meses,
                tipo_pago,
                fecha_inicio,
                id_cliente,
                id_inversor,
                id_asesor,
                cuotas
            } = req.body;

            // 1. Fetch associated info from DB
            const [client, advisor, investor] = await Promise.all([
                id_cliente ? Cliente.getById(id_cliente) : Promise.resolve(null),
                id_asesor ? User.findById(id_asesor) : Promise.resolve(null),
                id_inversor ? Inversores.findById(id_inversor) : Promise.resolve(null)
            ]);

            // Calculate end date
            let dateInicio = new Date(fecha_inicio || new Date());
            let dateFin = new Date(dateInicio);
            dateFin.setMonth(dateFin.getMonth() + parseInt(meses || 0));
            const fecha_fin = dateFin.toISOString().split('T')[0];

            // Parse numbers
            const parsedMonto = parseFloat(monto || 0);
            const rawInterest = parseFloat(interes || 0);
            const rate = rawInterest > 1 ? rawInterest / 100 : rawInterest;
            const montoInteres = parsedMonto * rate;
            
            let pago_mensual = montoInteres;
            if (tipo_pago === 'quincenal') {
                pago_mensual = montoInteres / 2;
            }
            const pago_total = parsedMonto + (montoInteres * parseInt(meses || 0));

            const loan = {
                id: 'SIMULACIÓN',
                monto: parsedMonto,
                moneda: moneda || 'pen',
                interes: rawInterest,
                meses: parseInt(meses || 0),
                tipo_pago: tipo_pago || 'mensual',
                pago_mensual,
                pago_total,
                fecha_inicio: fecha_inicio || new Date().toISOString().split('T')[0],
                fecha_fin
            };

            // Use provided cuotas or generate on-the-fly
            let finalCuotas = cuotas;
            if (!finalCuotas || finalCuotas.length === 0) {
                finalCuotas = [];
                let num_cuotas = parseInt(meses || 0);
                if (tipo_pago === 'quincenal') {
                    num_cuotas = num_cuotas * 2;
                }
                let tempDate = new Date(fecha_inicio || new Date());
                let saldoPendiente = parsedMonto;
                for (let i = 1; i <= num_cuotas; i++) {
                    if (tipo_pago === 'quincenal') {
                        tempDate.setDate(tempDate.getDate() + 15);
                    } else {
                        tempDate.setMonth(tempDate.getMonth() + 1);
                    }
                    let pagoCapital = 0;
                    let montoCuota = pago_mensual;
                    if (i === num_cuotas) {
                        pagoCapital = parsedMonto;
                        montoCuota = pago_mensual + parsedMonto;
                        saldoPendiente = 0;
                    }
                    finalCuotas.push({
                        fecha_vencimiento: tempDate.toISOString().split('T')[0],
                        pago_capital: pagoCapital,
                        pago_interes: pago_mensual,
                        monto: montoCuota,
                        saldo_pendiente: saldoPendiente
                    });
                }
            }

            // Set headers for inline PDF rendering
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', 'inline; filename="Propuesta_Prestamo_Simulacion.pdf"');

            // Generate PDF stream
            generateLoanPDF(loan, client, advisor, investor, finalCuotas, res);

        } catch (error) {
            res.status(500).json({
                message: "Error al generar el PDF de la simulación",
                error: error.message
            });
        }
    }
}

module.exports = PrestamosController;
