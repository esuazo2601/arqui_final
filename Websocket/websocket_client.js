const WebSocket = require('ws');
const ws_rest = new WebSocket('ws://rest_server:3000');
const ws_grpc = new WebSocket('ws://grpc_server:3002');
const ws_rabbit = new WebSocket('ws://rabbit_server:3003');

ws_rest.on('open', () => {
  console.log('Conectado al servidor de WebSocket de REST');
});

ws_rest.on('message', (data) => {
  // Convertir el buffer a una cadena de texto
  const message = data.toString('utf-8');
  console.log('Notificación recibida:', message); // Aquí se imprime el contenido de la notificación recibida como texto
  // También puedes hacer cualquier procesamiento adicional con `message` aquí
});

ws_grpc.on('open', () => {
  console.log('Conectado al servidor de WebSocket de gRPC');
});

ws_grpc.on('message', (data) => {
  // Convertir el buffer a una cadena de texto
  const message = data.toString('utf-8');
  console.log('Notificación recibida:', message); // Aquí se imprime el contenido de la notificación recibida como texto
  // También puedes hacer cualquier procesamiento adicional con `message` aquí
});

ws_rabbit.on('open', () => {
  console.log('Conectado al servidor de WebSocket de RabbitMQ');
});

ws_rabbit.on('message', (data) => {
  // Convertir el buffer a una cadena de texto
  const message = data.toString('utf-8');
  console.log('Notificación recibida:', message); // Aquí se imprime el contenido de la notificación recibida como texto
  // También puedes hacer cualquier procesamiento adicional con `message` aquí
});

