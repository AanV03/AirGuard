require('dotenv').config(); // Carga variables del .env

const express = require('express');
const mongoose = require('mongoose');

const app = express();
const port = process.env.PORT || 3000;

// Conexión a MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ Conectado a MongoDB Atlas'))
    .catch(err => console.error('❌ Error en conexión Mongo:', err));

// ruta para obtener archivos estaticos
const path = require('path');
app.use('/static', express.static(path.join(__dirname, 'static')));


app.use(express.urlencoded({ extended: true }));
app.use(express.json());


// Rutas

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'templates', 'Mainpage.html'));
});

// Ruta de login
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'templates', 'login.html'));
});

// Ruta de register
app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'templates', 'Register.html'));
});

// Ruta de configuration
app.get('/configuration', (req, res) => {
    res.sendFile(path.join(__dirname, 'templates', 'Configuration.html'));
});

const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');

app.use('/api/users', userRoutes); // para /register
app.use('/api/auth', authRoutes);  // para /login



app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});
