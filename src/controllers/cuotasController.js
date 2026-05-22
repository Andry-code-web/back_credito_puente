const Cuota = require('../models/cuotas');

class CuotasController {
    static async getCuotasByPrestamo(req, res) {
        try {
            const id_prestamo = req.params.id_prestamo;
            const cuotas = await Cuota.findByPrestamoId(id_prestamo);
            res.json(cuotas);
        } catch (error) {
            res.status(500).json({
                message: "Error al obtener las cuotas del préstamo",
                error: error.message
            });
        }
    }

    static async createCuota(req, res) {
        try {
            const insertId = await Cuota.create(req.body);
            res.json({
                message: "Cuota creada exitosamente",
                id: insertId
            });
        } catch (error) {
            res.status(500).json({
                message: "Error al crear la cuota",
                error: error.message
            });
        }
    }

    static async generarCuotas(req, res) {
        try {
            const { id_prestamo } = req.body;
            
            // Si el front-end ya manda el arreglo de cuotas generado, lo podemos recibir e insertar:
            if (req.body.cuotas && Array.isArray(req.body.cuotas)) {
                for (let cuota of req.body.cuotas) {
                    cuota.id_prestamo = id_prestamo;
                    await Cuota.create(cuota);
                }
                return res.json({ message: "Cuotas registradas exitosamente" });
            }

            return res.status(400).json({ message: "Falta enviar el arreglo de cuotas" });
        } catch (error) {
            res.status(500).json({
                message: "Error al generar o registrar las cuotas",
                error: error.message
            });
        }
    }
}

module.exports = CuotasController;
