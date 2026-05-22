const Cliente = require('../models/clientes');

class ClientesController {
    static async getAll(req, res) {
        try {
            const clientes = await Cliente.getAll();

            res.json(clientes)
        } catch (error) {
            res.status(500).json({
                message: "Error al obtener clientes",
                error: error.message
            });
        }
    }

    static async getById(req, res) {
        try {
            const { id } = req.params;
            const cliente = await Cliente.getById(id);

            res.json(cliente)
        } catch (error) {
            res.status(500).json({
                message: "Error al obtener cliente",
                error: error.message
            });
        }
    }

    static async create(req, res) {
        try {
            const cliente = req.body;
            const asesor_id = req.session?.user?.id || req.body.creado_por || 1;

            console.log(cliente);
            console.log(asesor_id);


            await Cliente.create(cliente, asesor_id);

            res.status(201).json({
                message: "Cliente creado"
            });
        } catch (error) {
            res.status(500).json({
                message: "Error al crear cliente",
                error: error.message
            });
        }
    }

    static async update(req, res) {
        try {
            const cliente = req.body;
            const id = req.params.id;

            await Cliente.update(id, cliente);

            res.json({
                message: "Cliente actualizado"
            })
        } catch (error) {
            res.status(500).json({
                message: "Error al actualizar cliente",
                error: error.message
            });
        }
    }

    static async delete(req, res) {
        try {
            await Cliente.delete(req.params.id);

            res.json({
                message: "Cliente eliminado"
            })
        } catch (error) {
            res.status(500).json({
                message: "Error al eliminar cliente",
                error: error.message
            });
        }
    }
}

module.exports = ClientesController;