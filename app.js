require('dotenv').config(); // Carga variables del .env

const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const verifyOwner = require('./middleware/verifyOwner');
const verifyToken = require('./middleware/verifyToken');

const app = express();

const cors = require('cors');
app.use(cors());

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

app.get('/carrito', (req, res) => {
    res.sendFile(path.join(__dirname, 'templates', 'Carrito.html'));
});

app.get('/configuration', verifyToken, verifyOwner, (req, res) => {
    res.sendFile(path.join(__dirname, 'templates', 'Configuration.html'));
});

app.get('/RecuperarContrasena', (req, res) => {
    res.sendFile(path.join(__dirname, 'templates', 'RecuperarContrasena.html'));
});

app.get('/CambiarContrasena', (req, res) => {
    res.sendFile(path.join(__dirname, 'templates', 'CambiarContrasena.html'));
});


// Rutas de API (controladores)
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');
const deviceRoutes = require('./routes/deviceRoutes');
const homeRoutes = require('./routes/HomeRoutes');
const scheduleRoutes = require('./routes/scheduleRoutes');
const usuarioRoutes = require('./routes/usuariosRoutes');
const soporteRoutes = require('./routes/soporteRoutes');
const recuperarRoutes = require('./routes/RecuperarContrasenaRoutes');
const cambiarContrasenaRoutes = require('./routes/CambiarContrasenaRoutes');
const chatbotRoutes = require('./routes/ChatBotRoutes');

app.use('/api/chatbot', chatbotRoutes); // maneja las rutas de chatbot
app.use('/api', cambiarContrasenaRoutes); // Ruta para cambiar la contrasena del usuario
app.use('/api/auth', recuperarRoutes);// Ruta para recuperar contraseña
app.use('/api/soporte', soporteRoutes); // Rutas de soporte, enviar reporte 
app.use('/api', scheduleRoutes); // horarios de lectura de dispositivos
app.use('/api/devices', deviceRoutes); // guardar y obtener dispositivos
app.use('/api/users', userRoutes); // registro, get/update/delete user
app.use('/api/auth', authRoutes);  // login
app.use('/api/home', homeRoutes); // home, dashboard, etc.
app.use('/api/usuarios', usuarioRoutes); // usuarios, roles, etc.

app.use((req, res) => {
    res.status(404).send('Página no encontrada');
});

require('./jobs/updateDeviceStates');

const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';

app.listen(PORT, HOST, () => {
    console.log(`Servidor corriendo en http://${HOST}:${PORT}`);
});


