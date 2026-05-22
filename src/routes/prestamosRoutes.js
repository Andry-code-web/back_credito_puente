const express = require('express');
const router = express.Router();

const PrestamosController = require('../controllers/prestamosController');

router.get("/", PrestamosController.getPrestamos);
router.get("/:id", PrestamosController.getPrestamoById);
router.post("/", PrestamosController.createPrestamo);
router.patch("/:id/status", PrestamosController.updateStatus);

module.exports = router;