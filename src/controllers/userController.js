const User = require('../models/users');

class UserController {
    static async getUsers(req, res) {
        try {
            const user = await User.findAll();

            res.json(user)
        } catch (error) {
            res.status(500).json({
                message: "Error al obtener usuarios",
                error: error.message
            });
        }
    }

    static async getUserById(req, res) {
        try {
            const user = await User.findById(req.params.id);

            res.json(user)
        } catch (error) {
            res.status(500).json({
                message: "Error al obtener usuario",
                error: error.message
            });
        }
    }

    static async createUser(req, res) {
        try {
            const user = await User.create(req.body);

            res.json(user)
        } catch (error) {
            res.status(500).json({
                message: "Error al crear usuario",
                error: error.message
            });
        }
    }

    static async updateUser(req, res) {

        try {

            const id = req.params.id;
            const user = req.body;

            await User.update(id, user);

            res.json({
                message: "Usuario actualizado"
            });

        } catch (error) {

            res.status(500).json({
                message: "Error al actualizar usuario",
                error: error.message
            });

        }
    }

    static async deleteUser(req, res) {
        try {
            const user = await User.delete(req.params.id);

            res.json(user)
        } catch (error) {
            res.status(500).json({
                message: "Error al eliminar usuario",
                error: error.message
            });
        }
    }
}


module.exports = UserController;