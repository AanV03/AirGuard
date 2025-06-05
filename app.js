require('dotenv').config(); // Carga variables del .env

const express = require('express');
const mongoose = require('mongoose');

const app = express();
const port = process.env.PORT || 3000;

// Conexión a MongoDB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log('✅ Conectado a MongoDB Atlas'))
    .catch(err => console.error('❌ Error en conexión Mongo:', err));

// Ruta de prueba
app.get('/', (req, res) => {
    res.send('Servidor Node.js activo 🚀');
});

app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});
