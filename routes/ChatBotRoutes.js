// routes/chatbotRoutes.js

const express = require('express');
const router = express.Router();
const chatbotController = require('../controllers/ChatBotController');

// Procesar consulta del chatbot (NLP)
router.post('/consulta', chatbotController.procesarConsulta);

// CRUD de conversaciones
router.post('/conversacion', chatbotController.crearConversacion);
router.post('/conversacion/mensaje', chatbotController.agregarMensaje);
router.get('/conversaciones', chatbotController.obtenerConversaciones);
router.get('/conversacion/:id', chatbotController.obtenerConversacion);
router.delete('/conversacion/:id', chatbotController.eliminarConversacion);
router.patch('/conversacion/:id', chatbotController.cambiarNombreConversacion);

// Feedback y historial
router.post('/feedback', chatbotController.guardarFeedback);
router.post('/historial', chatbotController.guardarHistorial);
router.get('/historial/:usuarioId', chatbotController.obtenerHistorial);

module.exports = router;
