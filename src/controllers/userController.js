const User = require('../models/users');
const bcrypt = require('bcrypt');


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

            const {
                nombre,
                usuario,
                password,
                correo,
                agencia,
                rol,
                celular
            } = req.body;

            await User.create({
                nombre,
                usuario,
                password,
                correo,
                agencia,
                rol,
                celular,
                is_active: 1
            });

            res.json({
                message: "Usuario creado"
            });

        } catch (error) {

            console.error(error);

            res.status(500).json({
                message: error.message
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
            await User.delete(req.params.id);

            res.json({
                message: "Usuario eliminado"
            })
        } catch (error) {
            res.status(500).json({
                message: "Error al eliminar usuario",
                error: error.message
            });
        }
    }
}


module.exports = UserController;