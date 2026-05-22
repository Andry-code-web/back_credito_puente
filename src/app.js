const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const app = express();

const PORT = process.env.PORT || 3000;

const userRoutes = require('./routes/userRoutes');
const clienteRoutes = require('./routes/clienteRoutes');
const inversoresRoutes = require('./routes/inversoresRoutes');
const simulacionRoutes = require('./routes/simulacionRoutes');
const prestamosRoutes = require('./routes/prestamosRoutes');
const cuotasRoutes = require('./routes/cuotasRoutes');

app.use(express.json());
app.use(morgan('dev'));
app.use(cors());

app.use('/users', userRoutes);
app.use('/clientes', clienteRoutes);
app.use('/inversores', inversoresRoutes);
app.use('/simulacion', simulacionRoutes);
app.use('/prestamos', prestamosRoutes);
app.use('/cuotas', cuotasRoutes);


app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto http://localhost:${PORT}`);
});