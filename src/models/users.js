const db = require('../config/db_config');
const bcrypt = require('bcrypt');

class User {

    static async findAll() {
        const [rows] = await db.execute(
            "SELECT * FROM usuarios"
        );

        return rows;
    }

    static async findById(id) {
        const [rows] = await db.execute(
            "SELECT * FROM usuarios WHERE id = ?",
            [id]
        );

        return rows[0];
    }

    static async create(user) {

        const hashedPassword = await bcrypt.hash(user.password, 10);

        const [result] = await db.execute(
            "INSERT INTO usuarios (nombre, correo, password, usuario, rol, celular, agencia, is_active, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())",
            [
                user.nombre,
                user.correo,
                hashedPassword,
                user.usuario,
                user.rol,
                user.celular,
                user.agencia,
                user.is_active
            ]
        );

        return result.insertId;
    }

    static async update(id, user) {

        let query = `
        UPDATE usuarios 
        SET nombre = ?, 
            correo = ?, 
            usuario = ?, 
            rol = ?, 
            celular = ?, 
            agencia = ?, 
            is_active = ?, 
            updated_at = NOW()
    `;

        let params = [
            user.nombre,
            user.correo,
            user.usuario,
            user.rol,
            user.celular,
            user.agencia,
            user.is_active
        ];

        if (user.password) {
            const hashedPassword = await bcrypt.hash(user.password, 10);

            query += ", password = ?";
            params.push(hashedPassword);
        }

        query += " WHERE id = ?";
        params.push(id);

        await db.execute(query, params);
    }

    static async delete(id) {

        await db.execute(
            "DELETE FROM usuarios WHERE id = ?",
            [id]
        );
    }
}

module.exports = User;