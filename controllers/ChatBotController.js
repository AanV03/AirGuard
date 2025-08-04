// controllers/chatbotController.js

const Conversacion = require('../models/ChatBot_models/models_conversacion');
const ChatFeedback = require('../models/ChatBot_models/models_Feedback');
const Tema = require('../models/ChatBot_models/models_temas');
const HistorialConsulta = require('../models//ChatBot_models/models_historial');
const { procesarConsulta } = require('../controllers/consultaController');

// Inicial: solo para debug al iniciar
Tema.find({}).then(temas => {
    console.log('[DEBUG] Temas cargados en chatbotController:', temas.map(t => t.clave));
});

exports.procesarConsulta = procesarConsulta;

exports.crearConversacion = async (req, res) => {
    const { sessionId, usuarioId = 'anonimo', nombre, mensajes } = req.body;
    try {
        if (!sessionId || !mensajes?.length) {
            return res.status(400).send("Datos insuficientes");
        }
        await Conversacion.create({ sessionId, usuarioId, nombre, mensajes });
        res.sendStatus(200);
    } catch (err) {
        console.error('[ERROR][crearConversacion]', err);
        res.status(500).send("Error al crear conversación");
    }
};

exports.agregarMensaje = async (req, res) => {
    const { sessionId, mensaje } = req.body;
    try {
        if (!sessionId || !mensaje) {
            return res.status(400).send("Faltan datos");
        }
        await Conversacion.updateOne(
            { sessionId },
            { $push: { mensajes: mensaje } }
        );
        res.sendStatus(200);
    } catch (err) {
        console.error('[ERROR][agregarMensaje]', err);
        res.status(500).send("Error al agregar mensaje");
    }
};

exports.obtenerConversaciones = async (req, res) => {
    const usuarioId = req.query.usuarioId;
    if (!usuarioId) return res.status(400).send("Falta usuarioId");
    try {
        const conversaciones = await Conversacion.find(
            { usuarioId },
            'sessionId nombre fechaCreacion'
        ).sort({ fechaCreacion: -1 });
        res.json(conversaciones);
    } catch (err) {
        console.error('[ERROR][obtenerConversaciones]', err);
        res.status(500).send("Error al obtener conversaciones");
    }
};

exports.obtenerConversacion = async (req, res) => {
    try {
        const conversacion = await Conversacion.findOne({ sessionId: req.params.id });
        if (!conversacion) return res.status(404).send("No encontrada");
        res.json(conversacion);
    } catch (err) {
        console.error('[ERROR][obtenerConversacion]', err);
        res.status(500).send("Error al obtener conversación");
    }
};

exports.eliminarConversacion = async (req, res) => {
    try {
        await Conversacion.deleteOne({ sessionId: req.params.id });
        res.sendStatus(200);
    } catch (err) {
        console.error('[ERROR][eliminarConversacion]', err);
        res.status(500).send("Error al eliminar conversación");
    }
};

exports.cambiarNombreConversacion = async (req, res) => {
    const { nuevoNombre } = req.body;
    if (!nuevoNombre || typeof nuevoNombre !== 'string') {
        return res.status(400).send("Nombre inválido");
    }
    try {
        await Conversacion.updateOne(
            { sessionId: req.params.id },
            { $set: { nombre: nuevoNombre } }
        );
        res.sendStatus(200);
    } catch (err) {
        console.error('[ERROR][cambiarNombreConversacion]', err);
        res.status(500).send("Error al editar nombre");
    }
};

exports.guardarFeedback = async (req, res) => {
    const {
        sessionId,
        mensajes,
        fueUtil,
        intencionesDetectadas = [],
        temasDetectados = [],
        subtemasDetectados = [],
        fin = new Date()
    } = req.body;

    if (!sessionId || !Array.isArray(mensajes) || mensajes.length < 2) {
        return res.status(400).json({ error: 'Faltan datos para el feedback' });
    }

    try {
        await ChatFeedback.create({
            sessionId,
            mensajes,
            fueUtil,
            intencionesDetectadas,
            temasDetectados,
            subtemasDetectados,
            fin
        });
        res.sendStatus(200);
    } catch (err) {
        console.error('[ERROR][guardarFeedback]', err);
        res.status(500).json({ error: 'Error al guardar feedback' });
    }
};

exports.guardarHistorial = async (req, res) => {
    const { usuarioId, mensaje } = req.body;
    if (!usuarioId || !mensaje) {
        return res.status(400).json({ error: 'usuarioId y mensaje son obligatorios' });
    }
    try {
        await HistorialConsulta.create({ usuarioId, mensaje });
        res.status(201).json({ ok: true });
    } catch (err) {
        console.error('[ERROR][guardarHistorial]', err);
        res.status(500).json({ error: 'Error al guardar historial' });
    }
};

exports.obtenerHistorial = async (req, res) => {
    const { usuarioId } = req.params;
    try {
        const historial = await HistorialConsulta.find({ usuarioId }).sort({ timestamp: 1 });
        res.json(historial);
    } catch (err) {
        console.error('[ERROR][obtenerHistorial]', err);
        res.status(500).json({ error: 'Error al obtener historial' });
    }
};