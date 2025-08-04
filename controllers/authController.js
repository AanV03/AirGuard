const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');

/**
 * Controlador para iniciar sesión de un usuario.
 * - Verifica email y contraseña.
 * - Genera un token JWT si son válidos.
 * - Envía el token como cookie httpOnly segura.
 */
exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Buscar usuario por email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ error: 'Credenciales inválidas' });
        }

        // Comparar contraseña ingresada con la almacenada (hash)
        const esValido = await user.compararPassword(password);
        if (!esValido) {
            return res.status(400).json({ error: 'Credenciales inválidas' });
        }

        // Crear token JWT con id, email y rol del usuario
        const token = jwt.sign(
            {
                id: user._id,
                email: user.email,
                role: user.role || 'user', // por si no tiene rol definido
                ownerId: user.ownerId || null
            },
            process.env.JWT_SECRET,     // clave secreta definida en .env
            { expiresIn: '2h' }          // el token expira en 2 horas
        );

        // Enviar el token como cookie segura httpOnly
        res.cookie('token', token, {
            httpOnly: true,              // no accesible desde JS (previene XSS)
            secure: false,               // poner true si usas HTTPS en producción
            sameSite: 'Strict',          // la cookie solo viaja en el mismo dominio
            maxAge: 2 * 60 * 60 * 1000   // duración: 2 horas en milisegundos
        });

        // Enviar info básica del usuario (sin contraseña ni token en cuerpo)
        res.status(200).json({
            message: 'Login exitoso',
            usuario: {
                _id: user._id,
                nombre: user.nombre,
                email: user.email
            }
        });

    } catch (error) {
        console.error('[loginUser] Error interno:', error);
        res.status(500).json({ error: 'Error al iniciar sesión' });
    }
};

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

exports.loginWithGoogle = async (req, res) => {
    const { credential } = req.body;

    try {
        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID
        });

        const payload = ticket.getPayload();
        const { email, name, sub } = payload;

        let user = await User.findOne({ email });
        if (!user) {
            user = await User.create({
                nombre: name,
                email,
                googleId: sub
            });
        }

        const token = jwt.sign(
            {
                id: user._id,                // igual que loginUser
                email: user.email,
                role: user.role || 'user'
            },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );


        res.status(200).json({
            user: {
                _id: user._id,
                nombre: user.nombre,
                email: user.email
            },
            token
        });

    } catch (err) {
        console.error('[Google Auth] Error al verificar token:', err);
        res.status(401).json({ error: 'Token de Google inválido' });
    }
};

//  cerrar la sesion activa
exports.logout = (req, res) => {
    res.clearCookie('token');
    res.status(200).json({ message: 'Sesión cerrada correctamente' });
};


