import { Request, Response, NextFunction } from 'express';
import { rabbitmqService, BlogNotificationMessage } from '../utils/rabbitmq';

export const blogNotificationMiddleware = async (
    req: Request, 
    res: Response, 
    next: NextFunction
): Promise<void> => {
    // Store the original res.json method
    const originalJson = res.json.bind(res);

    // Override res.json to intercept the response
    res.json = function(body: any) {
        // Check if this is a successful blog creation response
        if (res.statusCode === 201 && body?.success && body?.data) {
            const blogData = body.data;
            
            // Publish notification to RabbitMQ asynchronously
            publishBlogNotification(blogData, req)
                .catch(error => {
                    console.log('Error publishing blog notification:', error);
                });
        }

        return originalJson(body);
    };

    next();
};

async function publishBlogNotification(blogData: any, req: Request): Promise<void> {
    try {
        const { id, title, description, authorUser } = blogData;
        
        if (!id || !title) {
            console.log('Insufficient blog data for notification:', { id, title });
            return;
        }

        let authorName = '';
        if (authorUser?.name) {
            authorName = authorUser.name;
        } else {
            authorName = 'BlogM Author';
        }

        // Construct blog URL
        const baseUrl = process.env.WEBSITE_URL || 'http://localhost:5500';
        const blogUrl = `${baseUrl}/api/v2/blogs/${id}`;

        // Create the notification message
        const notificationMessage: BlogNotificationMessage = {
            type: 'new_blog_post',
            blogId: id,
            blogTitle: title,
            blogDescription: description || 'Check out this new blog post!',
            authorName: authorName,
            blogUrl: blogUrl,
            timestamp: new Date().toISOString()
        };

        console.log('Publishing blog notification:', notificationMessage);

        // Publish to RabbitMQ
        const published = await rabbitmqService.publishMessage('blog_notifications', notificationMessage);
        
        if (published) {
            console.log(`Blog notification published successfully for blog: ${title}`);
        } else {
            console.log(`Failed to publish blog notification for blog: ${title}`);
        }

    } catch (error) {
        console.log('Error in publishBlogNotification:', error);
    }
}
