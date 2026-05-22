const express = require('express');
const router = express.Router();

const CuotasController = require('../controllers/cuotasController');

router.get("/prestamo/:id_prestamo", CuotasController.getCuotasByPrestamo);
router.post("/", CuotasController.createCuota);
router.post("/generar", CuotasController.generarCuotas);

module.exports = router;
