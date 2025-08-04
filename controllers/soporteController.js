const { enviarCorreoSoporte } = require('../utils/sendMail');
const Reporte = require('../models/reporte');

const enviarReporte = async (req, res) => {
    try {
        const { tipo, nombre, email, descripcion, dispositivo, subusuario } = req.body;

        if (!tipo || !nombre || !email || !descripcion) {
            return res.status(400).json({ error: 'Faltan campos obligatorios' });
        }

        const archivo = req.file || null;

        // 1. Enviar correo
        await enviarCorreoSoporte({
            tipo,
            nombre,
            email,
            descripcion,
            dispositivo,
            subusuario,
            archivo
        });

        // 2. Guardar en MongoDB
        const nuevoReporte = new Reporte({
            tipo,
            nombre,
            email,
            descripcion,
            dispositivo: dispositivo || null,
            subusuario: subusuario || null,
            imagen: archivo ? archivo.originalname : null
        });

        await nuevoReporte.save();

        res.json({ mensaje: 'Reporte enviado correctamente' });
    } catch (err) {
        console.error('Error al enviar correo o guardar reporte:', err);
        res.status(500).json({ error: 'Error al procesar el reporte' });
    }
};

module.exports = {
    enviarReporte
};
