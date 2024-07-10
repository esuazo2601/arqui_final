const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

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

// Create gRPC client
const client = new protoDescriptor.MensajeService('localhost:50051', grpc.credentials.createInsecure());

// Function to create a new message
function crearMensaje(texto, fechaHora, sistema, estado) {
  return new Promise((resolve, reject) => {
    const mensaje = { Texto: texto, FechaHora: fechaHora, Sistema: sistema, Estado: estado };
    client.CrearMensaje(mensaje, (error, response) => {
      if (error) {
        reject(error);
      } else {
        resolve(response);
      }
    });
  });
}

// Function to get a message by ID
function obtenerMensaje(id) {
  return new Promise((resolve, reject) => {
    const request = { id: id };
    client.ObtenerMensaje(request, (error, response) => {
      if (error) {
        reject(error);
      } else {
        resolve(response);
      }
    });
  });
}

let grpc_msj = {
  Texto: 'Hola desde gRPC',
  FechaHora: new Date().toLocaleString(),
  Sistema: 'gRPC',
  Estado: 0
};

// Example usage
(async () => {
  try {
    // Crear un nuevo mensaje
    const nuevoMensaje = await crearMensaje(grpc_msj.Texto, grpc_msj.FechaHora, grpc_msj.Sistema, grpc_msj.Estado);
    console.log('Mensaje creado:', nuevoMensaje);

    // Obtener el mensaje creado
    const mensaje = await obtenerMensaje(nuevoMensaje.id);
    console.log('Mensaje obtenido:', mensaje);
  } catch (error) {
    console.error('Error:', error);
  }
})();
