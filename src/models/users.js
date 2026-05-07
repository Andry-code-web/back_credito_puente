const db = require('../config/db_config');
const bcrypt = require('bcrypt');

class User {

    static async findAll() {
        const [rows] = await db.execute(
            "SELECT * FROM users"
        );

        return rows;
    }

    static async findById(id) {
        const [rows] = await db.execute(
            "SELECT * FROM users WHERE id = ?",
            [id]
        );

        return rows[0];
    }

    static async create(user) {

        const hashedPassword = await bcrypt.hash(user.password, 10);

        const [result] = await db.execute(
            "INSERT INTO users (nombre, email, password, rol, activo, created_at) VALUES (?, ?, ?, ?, 1, NOW())",
            [
                user.nombre,
                user.email,
                hashedPassword,
                user.rol
            ]
        );

        return result.insertId;
    }

    static async update(id, user) {

        const hashedPassword = await bcrypt.hash(user.password, 10);

        await db.execute(
            "UPDATE users SET nombre = ?, email = ?, password = ?, rol = ? WHERE id = ?",
            [
                user.nombre,
                user.email,
                hashedPassword,
                user.rol,
                id
            ]
        );
    }

    static async delete(id) {

        await db.execute(
            "UPDATE users SET activo = 0 WHERE id = ?",
            [id]
        );
    }
}

module.exports = User;