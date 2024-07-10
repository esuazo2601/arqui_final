const amqp = require('amqplib/callback_api');
const mongoose = require('mongoose');
const WebSocket = require('ws');

const mongoUrl = process.env.MONGO_URL || 'mongodb://arqui:1221@mongo:27017/arqui?authSource=admin';
const rabbitUrl = process.env.RABBIT_URL || 'amqp://guest:guest@rabbitmq:5672';
const wsPort = 3003;

const MensajeSchema = new mongoose.Schema({
  Texto: String,
  FechaHora: String,
  Sistema: String,
  Estado: Number
});
const Mensaje = mongoose.model('Mensaje', MensajeSchema);

amqp.connect(rabbitUrl, (error0, connection) => {
  if (error0) {
    console.error('Error al conectar a RabbitMQ:', error0.message);
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

    console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", queue);
    
    // INICIAR WEBSOCKET
    const wss = new WebSocket.Server({ port: wsPort });
    const wsClients = [];

    wss.on('connection', (ws) => {
      console.log('Cliente conectado');
      wsClients.push(ws);
    });

    wss.on('close', () => {
      console.log('Cliente desconectado');
      // Eliminar el cliente desconectado de la lista
      wsClients.splice(wsClients.indexOf(ws), 1);
    });

    const sendTotalMessages = (message) => {
      wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({ message }));
        }
      });
    };

    console.log("WebSocket iniciado");
    
    channel.consume(queue, async (msg) => {
      const content = msg.content.toString();
      console.log(" [x] Received %s", content);

      try {
        await mongoose.connect(mongoUrl);
        console.log('MongoDB connected');

        let totalMessages = await Mensaje.countDocuments({});
        console.log("total messages: ", totalMessages);

        const newMensaje = new Mensaje({
          Texto: content,
          FechaHora: new Date().toLocaleString(),
          Sistema: 'RabbitMQ',
          Estado: 1
        });

        await newMensaje.save();

        console.log(" [x] Saved message to MongoDB");
        totalMessages++;
        sendTotalMessages(`Se ingresó un registro mediante el sistema ${newMensaje.Sistema} con el mensaje '${newMensaje.Texto}'. Total de mensajes: ${totalMessages}`);

        mongoose.connection.close(); // Cerrar la conexión a MongoDB después de guardar el mensaje
      } catch (err) {
        console.error('Error al procesar mensaje:', err);
        mongoose.connection.close(); // Cerrar la conexión en caso de error
      }
    }, {
      noAck: true
    });
  });
});
