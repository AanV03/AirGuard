const User = require('../models/User');
const PasswordReset = require('../models/PasswordTokens');

const resetPassword = async (req, res) => {
    const { token, newPassword, confirmPassword } = req.body;

    try {
        // Validación básica
        if (!token || !newPassword || !confirmPassword)
            return res.status(400).json({ message: 'Campos incompletos.' });

        if (newPassword !== confirmPassword)
            return res.status(400).json({ message: 'Las contraseñas no coinciden.' });

        // Buscar token en colección temporal
        const resetEntry = await PasswordReset.findOne({ token });

        if (!resetEntry)
            return res.status(400).json({ message: 'Token inválido o expirado.' });

        if (resetEntry.expiresAt < Date.now())
            return res.status(400).json({ message: 'El token ha expirado.' });

        // Buscar al usuario y actualizar contraseña
        const user = await User.findById(resetEntry.userId);
        if (!user)
            return res.status(404).json({ message: 'Usuario no encontrado.' });

        user.password = newPassword;

        await user.save();

        // Eliminar token usado
        await PasswordReset.deleteOne({ _id: resetEntry._id });

        res.status(200).json({ message: 'Contraseña actualizada correctamente.' });

    } catch (err) {
        console.error('Error en resetPassword:', err);
        res.status(500).json({ message: 'Error del servidor.' });
    }
};

module.exports = { resetPassword };
