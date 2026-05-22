const express = require('express');
const router = express.Router();
const inversoresController = require('../controllers/inversoresController');

router.get('/', inversoresController.getAll);
router.get('/:id', inversoresController.getById);
router.post('/', inversoresController.create);
router.put('/:id', inversoresController.update);
router.delete('/:id', inversoresController.delete);

module.exports = router;