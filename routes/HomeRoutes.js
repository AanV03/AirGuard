const express = require('express');
const router = express.Router();
const homeController = require('../controllers/HomeController');
const { getLastReadingByDispositivo_id } = require('../controllers/HomeController');
const verifyToken = require('../middleware/verifyToken');

// Obtener layout del usuario
router.get('/', verifyToken, homeController.getLayout);

// Guardar o actualizar layout
router.post('/', verifyToken, homeController.saveLayout);

// borrar el layout del usuario
router.delete('/', verifyToken, homeController.deleteLayout); 

// obtener las lecturas del dispositivo
router.get('/lecturas/ultimo/:dispositivo_id', verifyToken, getLastReadingByDispositivo_id);

module.exports = router;
