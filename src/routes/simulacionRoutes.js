const express = require('express');
const router = express.Router();

const SimulacionController = require('../controllers/simulacionController');

router.post("/", SimulacionController.simularCreditoPuente);

module.exports = router;
