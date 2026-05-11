const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const app = express();

const PORT = process.env.PORT || 3000;

const userRoutes = require('./routes/userRoutes');
const clienteRoutes = require('./routes/clienteRoutes');

app.use(express.json());
app.use(morgan('dev'));
app.use(cors());

app.use('/users', userRoutes);
app.use('/clientes', clienteRoutes);


app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto http://localhost:${PORT}`);
});