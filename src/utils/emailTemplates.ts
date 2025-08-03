import handlebars from 'handlebars';
import path from 'path';
import fs from 'fs';

export interface EmailTemplateData {
    email?: string;
    name?: string;
    unsubscribeLink?: string;
    websiteName?: string;
    websiteUrl?: string;
    // Blog notification specific data
    subscriberEmail?: string;
    blogTitle?: string;
    blogDescription?: string;
    authorName?: string;
    blogUrl?: string;
}

export type EmailTemplateType = 'subscription-welcome' | 'unsubscribe-confirmation' | 'new-blog-notification';

const getTemplatePath = (templateName: string): string => {
    return path.join(__dirname, '..', 'templates', 'emails', `${templateName}.hbs`);
};

export const renderEmailTemplate = (templateType: EmailTemplateType, data: EmailTemplateData): string => {
    try {
        const templatePath = getTemplatePath(templateType);
        
        if (!fs.existsSync(templatePath)) {
            throw new Error(`Template file not found: ${templatePath}`);
        }

        const templateSource = fs.readFileSync(templatePath, 'utf8');
        const template = handlebars.compile(templateSource);
        
        const defaultData: EmailTemplateData = {
            websiteName: process.env.WEBSITE_NAME || 'BlogM',
            websiteUrl: process.env.WEBSITE_URL || 'http://localhost:5500',
            ...data
        };

        const templateData = {
            ...defaultData,
            currentYear: new Date().getFullYear(),
            unsubscribeLink: data.unsubscribeLink || `${defaultData.websiteUrl}/api/v2/subscribers/unsubscribe?email=${data.email}`
        };

        return template(templateData);
    } catch (error) {
        console.log('Error rendering email template:', error);
        throw error;
    }
};
