const express = require('express');
const router = express.Router();
const soporteController = require('../controllers/soporteController');
const verifyToken = require('../middleware/verifyToken');
const multer = require('multer');

// Configurar multer para imagen (usamos memoria para adjunto por email, no guardamos en disco)
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post('/reporte', verifyToken, upload.single('imagen'), soporteController.enviarReporte);

module.exports = router;
