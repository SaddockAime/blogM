const amqp = require('amqplib');
import { config } from 'dotenv';

config();

class RabbitMQService {
    private connection: any = null;
    private channel: any = null;
    private readonly RABBITMQ_URL: string;
    
    constructor() {
        this.RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://admin:admin@rabbitmq:5672';
    }

    async connect(): Promise<void> {
        try {
            this.connection = await amqp.connect(this.RABBITMQ_URL);
            this.channel = await this.connection.createChannel();
            
            console.log('Connected to RabbitMQ');
            
            // Create the queue if it doesn't exist
            await this.channel.assertQueue('blog_notifications', {
                durable: true // Makes the queue survive broker restarts
            });
            
        } catch (error) {
            console.log('Error connecting to RabbitMQ:', error);
        }
    }

    async disconnect(): Promise<void> {
        try {
            if (this.channel) {
                await this.channel.close();
            }
            if (this.connection) {
                await this.connection.close();
            }
            console.log('Disconnected from RabbitMQ');
        } catch (error) {
            console.log('Error disconnecting from RabbitMQ:', error);
        }
    }

    async publishMessage(queue: string, message: any): Promise<boolean> {
        try {
            if (!this.channel) {
                await this.connect();
            }

            const messageBuffer = Buffer.from(JSON.stringify(message));
            const sent = this.channel!.sendToQueue(queue, messageBuffer, {
                persistent: true // Makes the message survive broker restarts
            });

            console.log(`Message published to queue ${queue}:`, message);
            return sent;
        } catch (error) {
            console.log('Error publishing message:', error);
            return false;
        }
    }

    async consumeMessages(queue: string, callback: (message: any) => Promise<void>): Promise<void> {
        try {
            if (!this.channel) {
                await this.connect();
            }

            await this.channel!.assertQueue(queue, { durable: true });
            
            // Set prefetch to 1 to ensure fair dispatch
            this.channel!.prefetch(1);

            console.log(`Waiting for messages from queue: ${queue}`);

            this.channel!.consume(queue, async (msg: any) => {
                if (msg) {
                    try {
                        const content = JSON.parse(msg.content.toString());
                        console.log(`Processing message from queue ${queue}:`, content);
                        
                        await callback(content);
                        
                        // Acknowledge the message after successful processing
                        this.channel!.ack(msg);
                        console.log(`Message processed successfully from queue ${queue}`);
                    } catch (error) {
                        console.log(`Error processing message from queue ${queue}:`, error);
                        // Reject the message and don't requeue it
                        this.channel!.nack(msg, false, false);
                    }
                }
            });
        } catch (error) {
            console.log('Error consuming messages:', error);
        }
    }

    getChannel(): any {
        return this.channel;
    }

    isConnected(): boolean {
        return this.connection !== null && this.channel !== null;
    }
}

// Export a singleton instance
export const rabbitmqService = new RabbitMQService();

// Export message types for type safety
export interface BlogNotificationMessage {
    type: 'new_blog_post';
    blogId: string;
    blogTitle: string;
    blogDescription: string;
    authorName: string;
    blogUrl: string;
    timestamp: string;
}
