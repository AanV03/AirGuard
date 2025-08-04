const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const verifyToken = require('../middleware/verifyToken');
const verifyAdmin = require('../middleware/verifyAdmin'); // ← nuevo middleware

// Ruta pública: cualquier persona puede registrarse
router.post('/register', userController.registerUser);

// Rutas protegidas: solo usuarios autenticados con JWT pueden acceder

// valida la sesion activa del usuario
router.get('/me', verifyToken, userController.getUserSession);

// Pero solo los ADMIN pueden acceder a estas:
router.get('/', verifyToken, verifyAdmin, userController.getUsers);           // ver todos
router.delete('/:id', verifyToken, verifyAdmin, userController.deleteUser);   // eliminar

// Estas pueden ser accesibles por el propio usuario
router.get('/:id', verifyToken, userController.getUserById);       // ver su perfil
router.put('/:id', verifyToken, userController.updateUser);        // editarse

module.exports = router;
