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
}


module.exports = UserController;