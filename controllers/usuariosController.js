const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { enviarCorreoBienvenida } = require('../utils/sendMail');
const bcrypt = require('bcrypt');

// Crear usuario hijo
exports.crearUsuarioHijo = async (req, res) => {
    try {
        const { nombre, email, password } = req.body;
        const ownerId = req.user.id; // <- tomado del token JWT

        if (!nombre || !email) {
            return res.status(400).json({ message: 'Faltan campos obligatorios.' });
        }

        // Verificar si el email ya existe
        const existente = await User.findOne({ email });
        if (existente) {
            return res.status(409).json({ message: 'Ese correo ya está en uso.' });
        }

        const nuevoUsuario = new User({
            nombre,
            email,
            password,
            role: 'user', // <- siempre es hijo
            ownerId
        });

        await nuevoUsuario.save();

        // Generar token para activación
        const token = jwt.sign(
            { id: nuevoUsuario._id },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        // Link de activación
        const link = `https://tuapp.com/activar-cuenta?token=${token}`;

        // Enviar correo
        await enviarCorreoBienvenida(email, nombre, link);

        res.status(201).json({ message: 'Usuario creado correctamente.' });
    } catch (err) {
        console.error('Error al crear usuario hijo:', err);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};

// Obtener hijos del usuario actual
exports.obtenerUsuariosHijos = async (req, res) => {
    try {
        const hijos = await User.find({ ownerId: req.user.id }).select('-password');
        res.status(200).json(hijos);
    } catch (err) {
        console.error('Error al obtener usuarios hijos:', err);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};

// Eliminar usuario hijo
exports.eliminarUsuarioHijo = async (req, res) => {
    try {
        const id = req.params.id;

        const eliminado = await User.findOneAndDelete({
            _id: id,
            ownerId: req.user.id // seguridad: que sea hijo de este user
        });

        if (!eliminado) {
            return res.status(404).json({ message: 'Usuario no encontrado o no autorizado.' });
        }

        res.status(200).json({ message: 'Usuario eliminado correctamente.' });
    } catch (err) {
        console.error('Error al eliminar usuario hijo:', err);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};

// actualizar informacion de usuario hijo
exports.actualizarUsuarioHijo = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, email } = req.body;

        const actualizado = await User.findOneAndUpdate(
            { _id: id, ownerId: req.user.id },
            { nombre, email },
            { new: true }
        );

        if (!actualizado) {
            return res.status(404).json({ message: 'Subusuario no encontrado o no autorizado.' });
        }

        res.status(200).json(actualizado);
    } catch (err) {
        console.error('Error al actualizar subusuario:', err);
        res.status(500).json({ message: 'Error interno al actualizar' });
    }
};

exports.activarCuentaSubusuario = async (req, res) => {
    try {
        const { token, nuevaPassword } = req.body;

        if (!token || !nuevaPassword) {
            return res.status(400).json({ message: 'Faltan datos obligatorios.' });
        }

        // Verificar el token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.id;

        // Buscar al usuario
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado.' });
        }

        // Validar que sea un subusuario
        if (!user.ownerId) {
            return res.status(403).json({ message: 'No autorizado. Solo subusuarios pueden activar cuenta.' });
        }

        // Hashear nueva contraseña
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(nuevaPassword, salt);

        // Actualizar usuario
        user.password = hash;
        await user.save();

        res.status(200).json({ message: 'Contraseña establecida correctamente. Ya puedes iniciar sesión.' });

    } catch (err) {
        console.error('Error al activar cuenta:', err);
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'El enlace ha expirado. Pide uno nuevo.' });
        }
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};


