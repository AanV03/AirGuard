const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.post('/register', userController.registerUser); // registro
router.get('/', userController.getUsers);              // obtener todos
router.get('/:id', userController.getUserById);        // por ID
router.put('/:id', userController.updateUser);         // actualizar
router.delete('/:id', userController.deleteUser);      // eliminar

module.exports = router;
