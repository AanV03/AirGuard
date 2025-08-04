const express = require('express');
const router = express.Router();
const usuariosController = require('../controllers/usuariosController');
const verifyToken = require('../middleware/verifyToken');

// Crear usuario hijo (solo para usuario padre)
router.post('/subusuarios', verifyToken, usuariosController.crearUsuarioHijo);

// Obtener usuarios hijos asociados al padre
router.get('/subusuarios', verifyToken, usuariosController.obtenerUsuariosHijos);

// Eliminar usuario hijo
router.delete('/subusuarios/:id', verifyToken, usuariosController.eliminarUsuarioHijo);

// actualizar datos del usuario hijo
router.put('/subusuarios/:id', verifyToken, usuariosController.actualizarUsuarioHijo);

// valida el usuario hijo y activa su cuenta por medio de un jwt token
router.put('/activar', usuariosController.activarCuentaSubusuario);

module.exports = router;
