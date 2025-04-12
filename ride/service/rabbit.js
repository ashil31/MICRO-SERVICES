const amqp = require('amqplib');

const RABBITMQ_URL = process.env.RABBIT_URL;

let connection;
let channel;

async function connectRabbit() {
    try {
        connection = await amqp.connect(RABBITMQ_URL);
        channel = await connection.createChannel();
        console.log('Connected to RabbitMQ');
    } catch (error) {
        console.error('Error connecting to RabbitMQ:', error);
    }
}

async function publishToQueue(queue, message) {
    try {
        if (!channel) await connectRabbit();
        await channel.assertQueue(queue);
        channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)));
        console.log(`Message sent to queue ${queue}`);
    } catch (error) {
        console.error('Error in publishToQueue:', error);
    }
}

async function subscribeToQueue(queue, callback) {
    try {
        if (!channel) await connectRabbit();
        await channel.assertQueue(queue);
        console.log(`Subscribed to queue ${queue}`);

        await channel.consume(queue, (msg) => {
            if (msg !== null) {
                const data = JSON.parse(msg.content.toString());
                callback(data);
                channel.ack(msg);
            }
        });
    } catch (error) {
        console.error('Error in subscribeToQueue:', error);
    }
}

module.exports = { connectRabbit, publishToQueue, subscribeToQueue };