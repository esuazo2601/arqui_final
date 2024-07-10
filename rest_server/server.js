const express = require('express');
const mongoose = require('mongoose');
const WebSocket = require('ws');
const http = require('http');

const app = express();
const port = 3000;

// Crear un servidor HTTP
const server = http.createServer(app);

// Crear una instancia de WebSocket Server y asociarla al servidor HTTP
const wss = new WebSocket.Server({ server });

// Middleware para analizar JSON
app.use(express.json());

// Definición del modelo de Mongoose
const Mensaje = mongoose.model('Mensaje', new mongoose.Schema({
    Texto: String,
    FechaHora: String,
    Sistema: String,
    Estado: Number
}));

// Conexión a MongoDB
mongoose.connect('mongodb://arqui:1221@mongo:27017/arqui?authSource=admin')
    .then(() => {
        console.log('MongoDB connected');
        // Obtener el conteo inicial de documentos en la colección 'mensajes'
        return Mensaje.countDocuments({});
    })
    .then(count => {
        console.log(`Número inicial de documentos en la colección 'mensajes': ${count}`);
        // Guardar el conteo inicial en una variable
        cont_mensajes = count;
    })
    .catch(err => console.error('Error al conectar a MongoDB:', err));

// Ruta de prueba
app.get('/', (req, res) => {
    res.send('Hello holanda!');
});

// Endpoint REST
app.post('/rest', (req, res) => {
    const msj = new Mensaje({
        Texto: req.body.Texto,
        FechaHora: req.body.FechaHora,
        Sistema: req.body.Sistema,
        Estado: req.body.Estado
    });

    msj.save()
        .then(result => {
            console.log(result);
            
            // Incrementar el contador de mensajes
            cont_mensajes++;

            // Notificar a través de WebSocket
            notifyClients(`Se ingresó un registro mediante el sistema ${msj.Sistema} con el mensaje '${msj.Texto}'. Total de mensajes: ${cont_mensajes}`);

            res.status(201).json({
                message: "Handling POST requests to /rest",
                createdProduct: result
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
});

// Función para notificar a los clientes WebSocket
const notifyClients = (message) => {
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ message }));
        }
    });
};

// Iniciar el servidor HTTP
server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
