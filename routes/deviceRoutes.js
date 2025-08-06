const express = require('express');
const router = express.Router();

const deviceController = require('../controllers/deviceController');
const verifyToken = require('../middleware/verifyToken');

// Todas las rutas requieren que el usuario esté autenticado

// Obtener todos los dispositivos del usuario
router.get('/', verifyToken, deviceController.getDevices);

// Crear un nuevo dispositivo
router.post('/', verifyToken, deviceController.createDevice);

// Obtener un dispositivo específico del usuario
router.get('/:id', verifyToken, deviceController.getDeviceById);

// Actualizar un dispositivo existente
router.put('/:id', verifyToken, deviceController.updateDevice);

// Eliminar un dispositivo
router.delete('/:id', verifyToken, deviceController.deleteDevice);

// 
router.post('/reiniciar/:id', verifyToken, deviceController.reiniciarDispositivo);

//
router.get('/comando/:id', deviceController.obtenerComando); 

module.exports = router;
