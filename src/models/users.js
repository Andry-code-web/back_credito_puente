const db = require('../config/db_config');
const bcrypt = require('bcrypt')

class User {
    static async findAll() {
        const [rows] = await db.execute("SELECT * FROM users")
        return rows;
    }

}

module.exports = User;