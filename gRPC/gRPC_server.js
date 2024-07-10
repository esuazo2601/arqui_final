const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const WebSocket = require('ws');
const mongoose = require('mongoose');

// MongoDB URL
const mongoUrl = 'mongodb://arqui:1221@mongo:27017/arqui?authSource=admin';
const wsPort = 3002;

// Connect to MongoDB once
mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log('Error connecting to MongoDB:', err));

// WebSocket setup
const wss = new WebSocket.Server({ port: wsPort });
const wsClients = [];

wss.on('connection', (ws) => {
  console.log('Cliente conectado');
  wsClients.push(ws);

  ws.on('close', () => {
    console.log('Cliente desconectado');
    wsClients.splice(wsClients.indexOf(ws), 1);
  });
});

const sendNotification = (message) => {
  wsClients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ message }));
    }
  });
};
console.log("WebSocket en", wsPort);

// MongoDB schema and model
const MensajeSchema = new mongoose.Schema({
  Texto: String,
  FechaHora: String,
  Sistema: String,
  Estado: Number
});
const Mensaje = mongoose.model('Mensaje', MensajeSchema);

// Load protobuf
const PROTO_PATH = './mensaje.proto';
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const protoDescriptor = grpc.loadPackageDefinition(packageDefinition).gRPC;

// gRPC service implementation
const mensajeService = {
  CrearMensaje: async (call, callback) => {
    const nuevoMensaje = {
      Texto: call.request.Texto,
      FechaHora: call.request.FechaHora,
      Sistema: call.request.Sistema,
      Estado: call.request.Estado,
    };

    console.log('Mensaje recibido:', nuevoMensaje);

    try {
      const newMensaje = new Mensaje({
        Texto: nuevoMensaje.Texto,
        FechaHora: new Date().toLocaleString(),
        Sistema: nuevoMensaje.Sistema,
        Estado: nuevoMensaje.Estado
      });

      await newMensaje.save();
      const totalMessages = await Mensaje.countDocuments({});

      sendNotification(`Se ingresó un registro mediante el sistema ${newMensaje.Sistema} con el mensaje '${newMensaje.Texto}'. Total de mensajes: ${totalMessages}`);

      callback(null, { id: newMensaje._id.toString(), mensaje: "Mensaje creado exitosamente", ...nuevoMensaje });
    } catch (error) {
      console.log("Error al guardar el mensaje:", error);
      callback(error, null);
    }
  },

  ObtenerMensaje: async (call, callback) => {
    try {
      const mensaje = await Mensaje.findById(call.request.id);
      if (mensaje) {
        callback(null, {
          id: mensaje._id.toString(),
          Texto: mensaje.Texto,
          FechaHora: mensaje.FechaHora,
          Sistema: mensaje.Sistema,
          Estado: mensaje.Estado,
        });
      } else {
        callback({
          code: grpc.status.NOT_FOUND,
          message: 'Mensaje no encontrado'
        });
      }
    } catch (error) {
      callback({
        code: grpc.status.INTERNAL,
        message: 'Error al obtener el mensaje'
      });
    }
  },
};

// Start gRPC server
const server = new grpc.Server();
server.addService(protoDescriptor.MensajeService.service, mensajeService);
server.bindAsync('0.0.0.0:50051', grpc.ServerCredentials.createInsecure(), () => {
  console.log('Servidor gRPC iniciado en 0.0.0.0:50051');
  server.start();
});
