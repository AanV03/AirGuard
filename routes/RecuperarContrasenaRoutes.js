const express = require('express');
const router = express.Router();
const recuperarController = require('../controllers/RecuperarContrasenaController');

router.post('/recuperar', recuperarController.solicitarReset);

module.exports = router;
