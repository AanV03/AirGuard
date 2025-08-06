const User = require('../models/User');
const PasswordReset = require('../models/PasswordTokens');
const { enviarCorreoRecuperacion } = require('../utils/sendMail');
const crypto = require('crypto');

exports.solicitarReset = async (req, res) => {
    const { email } = req.body;

    try {
        // Verificar si el correo está registrado
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ msg: 'Correo no encontrado.' });
        }

        // Generar token
        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = Date.now() + 1000 * 60 * 60; // 1 hora

        // Guardar token en colección PasswordReset
        await PasswordReset.create({
            userId: user._id,
            token,
            expiresAt
        });

        // Enlace de recuperación en entorno local
        const link = `http://localhost:3000/CambiarContrasena?token=${token}`;

        // Enviar correo
        await enviarCorreoRecuperacion(email, link);

        return res.json({ msg: 'Correo de recuperación enviado.' });

    } catch (error) {
        console.error('Error al solicitar reset:', error);
        res.status(500).json({ msg: 'Error interno.' });
    }
};
