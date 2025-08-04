const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// ruta de inicio de sesion tradicional
router.post('/login', authController.loginUser);

// ruta para inciar sesion con google
router.post('/google', authController.loginWithGoogle);

// ruta para cerrar sesion
router.post('/logout', authController.logout);

module.exports = router;
