const User = require('../models/User');

// 1) Obtener todos los usuarios
exports.getUsers = async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json(users);
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
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ error: 'Error al buscar usuario' });
    }
};

// 3) Crear un nuevo usuario
exports.createUser = async (req, res) => {
    try {
        const { nombre, email, ubicacion } = req.body;
        const newUser = new User({ nombre, email, ubicacion });
        await newUser.save();
        res.status(201).json(newUser);
    } catch (error) {
        // Si es un error de validación de Mongoose (email duplicado, etc.)
        res.status(400).json({ error: error.message });
    }
};

// 4) Actualizar datos de un usuario
exports.updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        const updatedUser = await User.findByIdAndUpdate(id, updates, { new: true });
        if (!updatedUser) return res.status(404).json({ error: 'Usuario no encontrado' });
        res.status(200).json(updatedUser);
    } catch (error) {
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
