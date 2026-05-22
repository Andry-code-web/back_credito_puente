class SimulacionController {
    static simularCreditoPuente(req, res) {
        try {
            // Parametros requeridos: monto, interes, meses, fecha_inicio
            let { monto, interes, meses, fecha_inicio } = req.body;
            
            monto = parseFloat(monto);
            interes = parseFloat(interes); 
            // Si el interes se envia como entero (ej. 5 en vez de 0.05), lo dividimos
            if (interes > 1) {
                interes = interes / 100;
            }
            meses = parseInt(meses);

            // 1. Monto interes = capital * interes
            const montoInteres = monto * interes;
            
            // 2. Pago total = monto + (monto * interes * meses)
            const pagoTotal = monto + (montoInteres * meses);

            let cuotas = [];
            // Fecha inicial
            let fecha = new Date(fecha_inicio || new Date());

            let saldoPendiente = monto;

            // 3. Monto de la cuota = monto interes, pero la ultima se le suma el capital
            for (let i = 1; i <= meses; i++) {
                // Sumar un mes para la fecha de vencimiento
                fecha.setMonth(fecha.getMonth() + 1);
                
                let pagoCapital = 0;
                let montoCuota = montoInteres;

                // Ultima cuota: se suma el capital
                if (i === meses) {
                    pagoCapital = monto;
                    montoCuota = montoInteres + monto;
                    saldoPendiente = 0; // El saldo final queda en 0
                }

                cuotas.push({
                    numero_cuota: i,
                    monto: parseFloat(montoCuota.toFixed(2)),
                    pago_capital: parseFloat(pagoCapital.toFixed(2)),
                    pago_interes: parseFloat(montoInteres.toFixed(2)),
                    saldo_pendiente: parseFloat(saldoPendiente.toFixed(2)),
                    fecha_vencimiento: fecha.toISOString().split('T')[0]
                });
            }

            res.json({
                resumen: {
                    monto_prestamo: monto,
                    tasa_interes: (interes * 100).toFixed(2) + '%',
                    meses: meses,
                    pago_total: parseFloat(pagoTotal.toFixed(2))
                },
                cuotas: cuotas
            });

        } catch (error) {
            res.status(500).json({
                message: "Error en la simulación del crédito puente",
                error: error.message
            });
        }
    }
}

module.exports = SimulacionController;
