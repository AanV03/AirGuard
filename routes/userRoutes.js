// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');

// POST /register
router.post('/register', async (req, res) => {
    try {
        const { nombre, email, password } = req.body;
        const existe = await User.findOne({ email });
        if (existe) return res.status(400).json({ error: 'Correo ya registrado' });

        const nuevoUsuario = new User({ nombre, email, password });
        await nuevoUsuario.save();
        res.status(201).json({ message: 'Usuario creado correctamente' });
    } catch (error) {
        res.status(500).json({ error: 'Error al registrar usuario' });
    }
});

// POST /login
router.post('/login', async (req, res) => {
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
});

module.exports = router;
