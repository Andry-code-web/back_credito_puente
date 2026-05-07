const express = require('express');
const app = express();

const userRoutes = require('./routes/userRoutes');
const clienteRoutes = require('./routes/clienteRoutes');

app.use(express.json());

app.use('/users', userRoutes);
app.use('/clientes', clienteRoutes);

app.listen(3000, () => {
    console.log('Servidor corriendo en el puerto 3000');
});