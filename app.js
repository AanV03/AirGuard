require('dotenv').config(); // Carga variables del .env

const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser'); // es clave para leer cookies

const app = express();
const port = process.env.PORT || 3000;

// Conexión a MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log(' Conectado a MongoDB Atlas'))
    .catch(err => console.error(' Error en conexión Mongo:', err));

// Middleware para parsear JSON, formularios y cookies
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser()); // es necesario para leer el token JWT de las cookies

// Ruta para archivos estáticos
const path = require('path');
app.use('/static', express.static(path.join(__dirname, 'static')));

// Rutas públicas (HTML)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'templates', 'Mainpage.html'));
});
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'templates', 'login.html'));
});
app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'templates', 'Register.html'));
});
app.get('/configuration', (req, res) => {
    res.sendFile(path.join(__dirname, 'templates', 'Configuration.html'));
});

// Rutas de API (controladores)
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');
const deviceRoutes = require('./routes/deviceRoutes');


app.use('/api/devices', deviceRoutes);
app.use('/api/users', userRoutes); // registro, get/update/delete user
app.use('/api/auth', authRoutes);  // login

// Levantar servidor
app.listen(port, () => {
    console.log(` Servidor corriendo en http://localhost:${port}`);
});
