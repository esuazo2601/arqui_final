const express = require('express');
const mongoose = require('mongoose');

const app = express();
const port = 3000;

const mensaje = mongoose.model('Mensaje', new mongoose.Schema({
    Texto: String,
    fechaHora: String,
    Sistema: String,
    estado: Number
}))


// Conexión a MongoDB
mongoose.connect('mongodb://arqui:1221@mongo:27017/arqui?authSource=admin')
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));

app.get('/', (req, res) => {
    res.send('Hello holi!');
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

app.get('/crear', async (_req, res) => {
    console.log('creando...')
    await mensaje.create({Texto: "Prueba",fechaHora:"10-06-2024",Sistema:"Rest", estado: 0})
    return res.send('ok')
  })