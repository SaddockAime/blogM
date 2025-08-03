import nodemailer from 'nodemailer';
import { config } from 'dotenv';

config();

export const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT!),
    secure: true,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

export interface EmailOptions {
    to: string;
    subject: string;
    html: string;
    from?: string;
}

export const sendEmail = async (options: EmailOptions): Promise<boolean> => {
    try {
        const mailOptions = {
            from: process.env.SMTP_USER,
            to: options.to,
            subject: options.subject,
            html: options.html,
        };

        await transporter.sendMail(mailOptions);
        return true;
    } catch (error) {
        console.log('Error sending email:', error);
        return false;
    }
};
