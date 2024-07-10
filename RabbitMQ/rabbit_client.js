const amqp = require('amqplib/callback_api');

const rabbitUrl = process.env.RABBIT_URL || 'amqp://guest:guest@rabbitmq:5672';

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
    const msg = 'Hola desde RabbitcitoMQ!';

    channel.assertQueue(queue, {
      durable: false
    });

    channel.sendToQueue(queue, Buffer.from(msg));
    console.log(" [x] Sent '%s'", msg);
  });

  setTimeout(() => {
    connection.close();
    process.exit(0);
  }, 500);
});
