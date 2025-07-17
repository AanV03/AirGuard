const User = require('../models/User');
const axios = require('axios');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// 1) Obtener todos los usuarios
exports.getUsers = async (req, res) => {
    try {
        const users = await User.find();

        // Mapear solo los campos seguros
        const safeUsers = users.map(user => ({
            _id: user._id,
            nombre: user.nombre,
            email: user.email,
            role: user.role,
            ubicacion: user.ubicacion
        }));

        res.status(200).json(safeUsers);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener usuarios' });
    }
};


// 2) Obtener un usuario por ID
exports.getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);

        if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

        // Enviar solo datos permitidos
        const { _id, nombre, email, role, ubicacion } = user;
        res.status(200).json({ _id, nombre, email, role, ubicacion });

    } catch (error) {
        res.status(500).json({ error: 'Error al buscar usuario' });
    }
};


// 3) Crear un nuevo usuario manualmente (sin geolocalización)
exports.createUser = async (req, res) => {
    try {
        const { nombre, email, ubicacion } = req.body;
        const newUser = new User({ nombre, email, ubicacion });
        await newUser.save();
        res.status(201).json(newUser);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// 4) Actualizar datos de un usuario
exports.updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = { ...req.body };

        if (updates.password) {
            const salt = await bcrypt.genSalt(10);
            updates.password = await bcrypt.hash(updates.password, salt);
        }

        const updatedUser = await User.findByIdAndUpdate(id, updates, { new: true });

        if (!updatedUser) return res.status(404).json({ error: 'Usuario no encontrado' });

        res.status(200).json(updatedUser);
    } catch (error) {
        console.error('[updateUser] Error:', error);
        res.status(400).json({ error: 'Error al actualizar usuario' });
    }
};

// 5) Eliminar un usuario
exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await User.findByIdAndDelete(id);
        if (!deleted) return res.status(404).json({ error: 'Usuario no encontrado' });
        res.status(200).json({ message: 'Usuario eliminado' });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar usuario' });
    }
};

// 6) Registrar usuario (con geolocalización)
exports.registerUser = async (req, res) => {
    try {
        const { nombre, email, password, lat, long } = req.body;

        // Verificar si el correo ya existe
        const existe = await User.findOne({ email });
        if (existe) return res.status(400).json({ error: 'Correo ya registrado' });

        // Geolocalización opcional
        let ciudad = null;
        let pais = null;

        if (lat && long) {
            const geoRes = await axios.get('https://nominatim.openstreetmap.org/reverse', {
                params: {
                    format: 'json',
                    lat,
                    lon: long,
                    addressdetails: 1
                },
                headers: {
                    'User-Agent': 'AirGuard/1.0'
                }
            });

            const address = geoRes.data.address || {};
            ciudad = address.city || address.town || address.village || null;
            pais = address.country || null;
        }

        // Crear nuevo usuario
        const nuevoUsuario = new User({
            nombre,
            email,
            password,
            ubicacion: {
                lat: parseFloat(lat),
                long: parseFloat(long),
                ciudad,
                pais
            }
        });

        await nuevoUsuario.save();

        // ✅ Generar token JWT al registrarse
        const token = jwt.sign(
            {
                id: nuevoUsuario._id,
                email: nuevoUsuario.email,
                role: nuevoUsuario.role || 'user'
            },
            process.env.JWT_SECRET,
            { expiresIn: '2h' }
        );

        // ✅ Enviar cookie segura httpOnly
        res.cookie('token', token, {
            httpOnly: true,
            secure: false, // se puede cambiar a true en producción con HTTPS
            sameSite: 'Strict',
            maxAge: 2 * 60 * 60 * 1000 // 2 horas
        });

        // ✅ Enviar respuesta con datos útiles (sin contraseña)
        res.status(201).json({
            message: 'Usuario registrado y autenticado',
            usuario: {
                _id: nuevoUsuario._id,
                nombre: nuevoUsuario.nombre,
                email: nuevoUsuario.email
            }
        });

    } catch (error) {
        console.error('[registerUser] Error interno:', error);
        res.status(500).json({ error: 'Error al registrar usuario' });
    }
};
