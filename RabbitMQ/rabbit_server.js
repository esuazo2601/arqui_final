const amqp = require('amqplib/callback_api');
const mongoose = require('mongoose');
const WebSocket = require('ws');

const mongoUrl = process.env.MONGO_URL || 'mongodb://arqui:1221@mongo:27017/arqui?authSource=admin';
const rabbitUrl = process.env.RABBIT_URL || 'amqp://guest:guest@rabbitmq:5672';
const wsPort = 3003;

// Iniciar WebSocket Server
const wss = new WebSocket.Server({ port: wsPort });
const wsClients = [];

wss.on('connection', (ws) => {
  console.log('Cliente conectado');

  // Agregar cliente a la lista de clientes activos
  wsClients.push(ws);

  // Manejar evento de cierre del WebSocket
  ws.on('close', () => {
    console.log('Cliente desconectado');
    // Eliminar cliente de la lista de clientes activos
    const index = wsClients.indexOf(ws);
    if (index > -1) {
      wsClients.splice(index, 1);
    }
  });
});

console.log('WebSocket iniciado');

// Definir esquema y modelo de Mongoose
const MensajeSchema = new mongoose.Schema({
  Texto: String,
  FechaHora: String,
  Sistema: String,
  Estado: Number
});
const Mensaje = mongoose.model('Mensaje', MensajeSchema);

// Función para intentar conectar a RabbitMQ hasta que tenga éxito
const connectToRabbitMQ = () => {
  amqp.connect(rabbitUrl, (error0, connection) => {
    if (error0) {
      console.error('Error al conectar a RabbitMQ:', error0.message);
      console.log('Reintentando en 5 segundos...');
      setTimeout(connectToRabbitMQ, 5000);
      return;
    }
    console.log('Connected to RabbitMQ');

    connection.createChannel((error1, channel) => {
      if (error1) {
        console.error('Error al crear el canal:', error1.message);
        return;
      }
      console.log('Channel created');

      const queue = 'hello';

      channel.assertQueue(queue, {
        durable: false
      });

      console.log(`[*] Waiting for messages in ${queue}. To exit press CTRL+C`);

      // Función para enviar mensajes a todos los clientes WebSocket
      const sendTotalMessages = (message) => {
        wss.clients.forEach(client => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ message }));
          }
        });
      };

      // Consumir mensajes desde RabbitMQ
      channel.consume(queue, async (msg) => {
        const content = msg.content.toString();
        console.log(`[x] Received ${content}`);

        try {
          await mongoose.connect(mongoUrl);
          console.log('MongoDB connected');

          // Contar documentos en la colección
          let totalMessages = await Mensaje.countDocuments({});
          console.log("Total de mensajes:", totalMessages);

          // Crear un nuevo mensaje en MongoDB
          const newMensaje = new Mensaje({
            Texto: content,
            FechaHora: new Date().toLocaleString(),
            Sistema: 'RabbitMQ',
            Estado: 1
          });

          await newMensaje.save();

          console.log("[x] Saved message to MongoDB");
          totalMessages++;
          
          // Enviar notificación a todos los clientes WebSocket
          sendTotalMessages(`Se ingresó un registro mediante el sistema ${newMensaje.Sistema} con el mensaje '${newMensaje.Texto}'. Total de mensajes: ${totalMessages}`);

          // Cerrar conexión a MongoDB después de guardar el mensaje
          mongoose.connection.close();
        } catch (err) {
          console.error('Error al procesar mensaje:', err);
          // Cerrar conexión a MongoDB en caso de error
          mongoose.connection.close();
        }
      }, {
        noAck: true
      });
    });
  });
};

// Iniciar el intento de conexión a RabbitMQ
connectToRabbitMQ();
