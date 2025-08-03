import { rabbitmqService, BlogNotificationMessage } from './rabbitmq';
import { Database } from '../database';
import { sendEmail } from './emailConfig';
import { renderEmailTemplate } from './emailTemplates';

class EmailWorkerService {
    private isRunning: boolean = false;

    async start(): Promise<void> {
        if (this.isRunning) {
            console.log('Email worker is already running');
            return;
        }

        try {
            await rabbitmqService.connect();
            this.isRunning = true;
            
            console.log('Starting email worker service...');
            
            // Start consuming messages from the blog_notifications queue
            await rabbitmqService.consumeMessages('blog_notifications', this.processBlogNotification.bind(this));
            
        } catch (error) {
            console.log('Error starting email worker service:', error);
            this.isRunning = false;
            throw error;
        }
    }

    async stop(): Promise<void> {
        if (!this.isRunning) {
            return;
        }

        try {
            await rabbitmqService.disconnect();
            this.isRunning = false;
            console.log('Email worker service stopped');
        } catch (error) {
            console.log('Error stopping email worker service:', error);
        }
    }

    private async processBlogNotification(message: BlogNotificationMessage): Promise<void> {
        try {
            console.log('Processing blog notification:', message);

            // Get all active subscribers
            const subscribers = await Database.Subscriber.findAll({
                where: { isSubscribed: true }
            });

            if (subscribers.length === 0) {
                console.log('No active subscribers found');
                return;
            }

            console.log(`Sending blog notification to ${subscribers.length} subscribers`);

            // Send email to each subscriber
            const emailPromises = subscribers.map(async (subscriber) => {
                try {
                    const unsubscribeLink = `${process.env.WEBSITE_URL || 'http://localhost:5500'}/api/v2/subscribers/unsubscribe?email=${encodeURIComponent(subscriber.email)}`;
                    
                    const emailHTML = renderEmailTemplate('new-blog-notification', {
                        subscriberEmail: subscriber.email,
                        blogTitle: message.blogTitle,
                        blogDescription: message.blogDescription,
                        authorName: message.authorName,
                        blogUrl: message.blogUrl,
                        unsubscribeLink: unsubscribeLink,
                        websiteName: process.env.WEBSITE_NAME || 'BlogM'
                    });

                    const emailSent = await sendEmail({
                        to: subscriber.email,
                        subject: `New Blog Post: ${message.blogTitle}`,
                        html: emailHTML
                    });

                    if (emailSent) {
                        console.log(`Email sent successfully to: ${subscriber.email}`);
                    } else {
                        console.log(`Failed to send email to: ${subscriber.email}`);
                    }

                    return emailSent;
                } catch (error) {
                    console.log(`Error sending email to ${subscriber.email}:`, error);
                    return false;
                }
            });

            // Wait for all emails to be processed
            const results = await Promise.allSettled(emailPromises);
            
            const successCount = results.filter(result => 
                result.status === 'fulfilled' && result.value === true
            ).length;
            
            const failureCount = results.length - successCount;

            console.log(`Blog notification processing completed: ${successCount} successful, ${failureCount} failed`);

        } catch (error) {
            console.log('Error processing blog notification:', error);
            throw error;
        }
    }

    isWorkerRunning(): boolean {
        return this.isRunning;
    }
}

// Export a singleton instance
export const emailWorkerService = new EmailWorkerService();
