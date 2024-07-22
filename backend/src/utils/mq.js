import amqp from "amqplib/callback_api.js";
import EventEmitter from 'events'

export default ({
    username,
    password,
    host,
    port
}) => {
    const connectionString = `amqp://${username}:${password}@${host}:${port}`

    const publish = (payload, queueName, queueParams = { durable: false }) => {

        amqp.connect(connectionString, (connectionError, connection) => {
            if (connectionError) {
                console.log(`Failed to connect to rabbitmq at ${host}:${port} for publishing`)
                throw connectionError
            }

            connection.createChannel((channelError, channel) => {
                if (channelError) {
                    throw channelError
                }

                var data = JSON.stringify(payload);
                channel.assertQueue(queueName, queueParams);
                channel.sendToQueue(queueName, Buffer.from(data));
            })
        })
    }

    const createConsumer = (queueName, queueParams, autoAcknowledge = false) => {
        const eventEmitter = new EventEmitter()

        amqp.connect(connectionString, (connectionError, connection) => {
            if (connectionError) {
                console.log(`Failed to consume from rabbitmq at ${host}:${port}`)
                throw connectionError
            }

            connection.createChannel((channelError, channel) => {
                if (channelError) {
                    throw channelError
                }

                channel.assertQueue(queueName, queueParams);
                channel.consume(queueName, (message) => {
                    if (message != null) {
                        let contents = JSON.parse(message.content.toString())
                        console.log('===== Receive =====');
                        console.log(contents);

                        if (autoAcknowledge) {
                            eventEmitter.emit('data', contents)
                        } else {
                            const ack = () => { channel.ack(message) }
                            const nack = () => { channnel.nack(message) }
                            eventEmitter.emit('data', contents, ack, nack)
                        }
                    }
                }, {
                    noAck: autoAcknowledge
                })
            })
        })

        return eventEmitter
    }

    return {
        publish,
        createConsumer
    }
}