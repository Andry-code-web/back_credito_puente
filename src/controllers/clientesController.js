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
            const cliente = await Cliente.getById(req.params.id);

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

            const id = await Cliente.create(cliente);

            res.status(201).json({
                message: "Cliente creado",
                id
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
                message: "Cliente actualizado",
                id
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
            const cliente = await Cliente.delete(req.params.id);

            res.json(cliente)
        } catch (error) {
            res.status(500).json({
                message: "Error al eliminar cliente",
                error: error.message
            });
        }
    }
}

module.exports = ClientesController;