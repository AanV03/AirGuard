const User = require('../models/User');

exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ error: 'Credenciales inválidas' });

        const esValido = await user.compararPassword(password);
        if (!esValido) return res.status(400).json({ error: 'Credenciales inválidas' });

        res.status(200).json({ message: 'Login exitoso', usuario: user.nombre });
    } catch (error) {
        res.status(500).json({ error: 'Error al iniciar sesión' });
    }
};
