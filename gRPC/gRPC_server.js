// Dependencies
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const mongoose = require('mongoose');
const WebSocket = require('ws');

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

// MongoDB connection
async function main() {
  try {
    await mongoose.connect('mongodb://arqui:1221@mongo:27017/arqui?authSource=admin')
  }catch (e){
    console.log(e)
  }
}

main().catch(err => console.error('MongoDB connection error:', err));

const Mensaje = mongoose.model('Mensaje', new mongoose.Schema({
  Texto: String,
  FechaHora: String,
  Sistema: String,
  Estado: Number,
}));

// WebSocket Server
const wss = new WebSocket.Server({ port: 8765 });
let websocketClients = [];

wss.on('connection', (ws) => {
  websocketClients.push(ws);
  ws.on('close', () => {
    websocketClients = websocketClients.filter(client => client !== ws);
  });
});

// gRPC service implementation
const mensajeService = {
  CrearMensaje: async (call, callback) => {
    const nuevoMensaje = new Mensaje({
      Texto: call.request.Texto,
      FechaHora: call.request.FechaHora,
      Sistema: call.request.Sistema,
      Estado: call.request.Estado,
    });
    const result = await nuevoMensaje.save();

    // Notify all WebSocket clients
    const notification = `Nuevo mensaje: ${JSON.stringify(call.request)}`;
    websocketClients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(notification);
      }
    });

    callback(null, { id: result._id.toString(), mensaje: "Mensaje creado exitosamente" });
  },
  ObtenerMensaje: async (call, callback) => {
    const mensaje = await Mensaje.findById(call.request.id);
    if (mensaje) {
      callback(null, {
        Texto: mensaje.Texto,
        FechaHora: mensaje.FechaHora,
        Sistema: mensaje.Sistema,
        Estado: mensaje.Estado,
      });
    } else {
      callback({
        code: grpc.status.NOT_FOUND,
        message: 'Mensaje no encontrado',
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

// Start WebSocket server
console.log('Servidor WebSocket iniciado en ws://localhost:8765');
