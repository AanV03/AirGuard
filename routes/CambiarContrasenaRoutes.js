// routes/CambiarContrasenaRoutes.js
const express = require('express');
const router = express.Router();
const CambiarContrasenaController = require('../controllers/CambiarContrasenaController');

// POST /api/reset-password
router.post('/reset-password', CambiarContrasenaController.resetPassword);

module.exports = router;
