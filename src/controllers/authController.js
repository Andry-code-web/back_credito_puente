const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const db = require('../config/db_config');

exports.login = async (req, res) => {
    try {
        const { usuario, password } = req.body;

        const [rows] = await db.execute(
            'SELECT * FROM usuarios WHERE usuario = ? LIMIT 1',
            [usuario]
        );

        if (rows.length === 0) {
            return res.status(401).json({
                message: 'Usuario no encontrado',
            });
        }

        const user = rows[0];

        // Verificar si está activo
        if (!user.is_active) {
            return res.status(403).json({
                message: 'Usuario desactivado',
            });
        }

        // Comparar password
        const passwordMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!passwordMatch) {
            return res.status(401).json({
                message: 'Contraseña incorrecta',
            });
        }

        // Crear token
        const token = jwt.sign(
            {
                id: user.id,
                usuario: user.usuario,
                rol: user.rol,
                agencia: user.agencia,
            },
            process.env.JWT_SECRET || 'secret_key',
            {
                expiresIn: '1d',
            }
        );

        // Respuesta
        res.json({
            token,
            user: {
                id: user.id,
                nombre: user.nombre,
                usuario: user.usuario,
                correo: user.correo,
                rol: user.rol,
                agencia: user.agencia,
            },
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: 'Error interno del servidor',
        });
    }
};