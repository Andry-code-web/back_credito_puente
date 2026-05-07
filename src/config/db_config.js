const mysql = require('mysql2/promise');
require('dotenv').config();

const connection = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
});

connection.getConnection()
    .then(() => {
        console.log('Conexión exitosa');
    })
    .catch((error) => {
        console.log('Error al conectar a la base de datos');
    });

module.exports = connection;