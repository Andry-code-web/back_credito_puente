const Inversores = require('../models/inversores');

class InversoresController {
    static async getAll(req, res) {
        try {
            const inversores = await Inversores.findAll();
            res.json(inversores);
        } catch (error) {
            res.status(500).json({
                message: "Error al obtener inversores",
                error: error.message
            });
        }
    }

    static async getById(req, res) {
        try {
            const inversor = await Inversores.findById(req.params.id);
            res.json(inversor);
        } catch (error) {
            res.status(500).json({
                message: "Error al obtener inversor",
                error: error.message
            });
        }
    }

    static async create(req, res) {
        try {

            const inversor = req.body;
            const asesor_id = req.session?.user?.id || req.body.creado_por || 1;

            await Inversores.create(inversor, asesor_id);
            res.json({
                message: "Inversor creado exitosamente"
            });
        } catch (error) {
            res.status(500).json({
                message: "Error al crear inversor",
                error: error.message
            });
        }
    }

    static async update(req, res) {
        try {
            const inversor = req.body;
            const id = req.params.id;

            await Inversores.update(id, inversor);
            res.json({
                message: "Inversor actualizado exitosamente"
            });
        } catch (error) {
            res.status(500).json({
                message: "Error al actualizar inversor",
                error: error.message
            });
        }
    }

    static async delete(req, res) {
        try {
            await Inversores.delete(req.params.id);
            res.json({
                message: "Inversor eliminado exitosamente"
            });
        } catch (error) {
            res.status(500).json({
                message: "Error al eliminar inversor",
                error: error.message
            });
        }
    }
}

module.exports = InversoresController;