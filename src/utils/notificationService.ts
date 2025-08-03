import { emailWorkerService } from './emailWorker';
import { rabbitmqService } from './rabbitmq';

class NotificationService {
    private static instance: NotificationService;
    private isInitialized: boolean = false;

    private constructor() {}

    public static getInstance(): NotificationService {
        if (!NotificationService.instance) {
            NotificationService.instance = new NotificationService();
        }
        return NotificationService.instance;
    }

    async initialize(): Promise<void> {
        if (this.isInitialized) {
            console.log('Notification service already initialized');
            return;
        }

        try {
                        
            await rabbitmqService.connect();
            
            await emailWorkerService.start();
            
            this.isInitialized = true;
            console.log('Notification service initialized successfully');
            
        } catch (error) {
            console.log('Failed to initialize notification service:', error);
        }
    }

    async shutdown(): Promise<void> {
        if (!this.isInitialized) {
            return;
        }

        try {
            console.log('Shutting down notification service...');
            
            // Stop the email worker service
            await emailWorkerService.stop();
            
            // Disconnect from RabbitMQ
            await rabbitmqService.disconnect();
            
            this.isInitialized = false;
            console.log('Notification service shut down successfully');
            
        } catch (error) {
            console.log('Error shutting down notification service:', error);
        }
    }

    isServiceInitialized(): boolean {
        return this.isInitialized;
    }
}

export const notificationService = NotificationService.getInstance();
