import { Request, Response } from "express";
import { ResponseService } from "../utils/response";
import { Database } from "../database";
import { sendEmail } from "../utils/emailConfig";
import { renderEmailTemplate } from "../utils/emailTemplates";
import { AddSubscriberInterface } from "../types/subscriberInterface";

interface SubscribeRequest extends Request {
    body: AddSubscriberInterface;
}

interface UnsubscribeRequest extends Request {
    query: AddSubscriberInterface;
}

export const subscribe = async (req: SubscribeRequest, res: Response) => {
    try {
        const { email } = req.body;

        const existingSubscriber = await Database.Subscriber.findOne({ 
            where: { email } 
        });

        if (existingSubscriber) {
            if (!existingSubscriber.isSubscribed) {
                await existingSubscriber.update({ isSubscribed: true });
                
                const emailHTML = renderEmailTemplate('subscription-welcome', {
                    email,
                    unsubscribeLink: `${process.env.WEBSITE_URL || 'http://localhost:5500'}/api/v2/subscribers/unsubscribe?email=${encodeURIComponent(email)}`
                });

                await sendEmail({
                    to: email,
                    subject: `Welcome back to ${process.env.WEBSITE_NAME || 'BlogM'}!`,
                    html: emailHTML
                });

                return ResponseService({
                    data: { email, isSubscribed: true },
                    status: 200,
                    success: true,
                    message: "You have resubscribed successfully",
                    res
                });
            } else {
                return ResponseService({
                    data: null,
                    status: 409,
                    success: false,
                    message: "This email is already subscribed to our newsletter",
                    res
                });
            }
        }

        const newSubscriber = await Database.Subscriber.create({
            email,
            isSubscribed: true
        });

        const emailHTML = renderEmailTemplate('subscription-welcome', {
            email,
            unsubscribeLink: `${process.env.WEBSITE_URL || 'http://localhost:5500'}/api/v2/subscribers/unsubscribe?email=${encodeURIComponent(email)}`
        });

        await sendEmail({
            to: email,
            subject: `Welcome to ${process.env.WEBSITE_NAME || 'BlogM'}!`,
            html: emailHTML
        });

        ResponseService({
            data: { 
                id: newSubscriber.id,
                email: newSubscriber.email, 
                isSubscribed: newSubscriber.isSubscribed,
                subscribedAt: newSubscriber.createdAt
            },
            status: 201,
            success: true,
            message: "Successfully subscribed",
            res
        });

    } catch (error) {
        const { message, stack } = error as Error;
        ResponseService({
            data: { message, stack },
            status: 500,
            success: false,
            res
        });
    }
};

export const unsubscribe = async (req: UnsubscribeRequest, res: Response) => {
    try {
        const { email } = req.query;

        const subscriber = await Database.Subscriber.findOne({ 
            where: { email } 
        });

        if (!subscriber) {
            return ResponseService({
                data: null,
                status: 404,
                success: false,
                message: "Email not found in our subscription list",
                res
            });
        }

        if (!subscriber.isSubscribed) {
            return ResponseService({
                data: null,
                status: 400,
                success: false,
                message: "This email is already unsubscribed",
                res
            });
        }

        await subscriber.update({ isSubscribed: false });

        const emailHTML = renderEmailTemplate('unsubscribe-confirmation', {
            email
        });

        await sendEmail({
            to: email,
            subject: `Unsubscribed from ${process.env.WEBSITE_NAME || 'BlogM'}`,
            html: emailHTML
        });

        ResponseService({
            data: { 
                email: subscriber.email, 
                isSubscribed: false,
                unsubscribedAt: new Date()
            },
            status: 200,
            success: true,
            message: "Successfully unsubscribed",
            res
        });

    } catch (error) {
        const { message, stack } = error as Error;
        ResponseService({
            data: { message, stack },
            status: 500,
            success: false,
            res
        });
    }
};

export const getAllSubscribers = async (req: Request, res: Response) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const offset = (Number(page) - 1) * Number(limit);

        const { count, rows: subscribers } = await Database.Subscriber.findAndCountAll({
            limit: Number(limit),
            offset,
            order: [['createdAt', 'DESC']]
        });

        const totalPages = Math.ceil(count / Number(limit));

        ResponseService({
            data: {
                subscribers,
                pagination: {
                    currentPage: Number(page),
                    totalPages,
                    totalSubscribers: count,
                    limit: Number(limit)
                }
            },
            status: 200,
            success: true,
            message: "Subscribers retrieved successfully",
            res
        });

    } catch (error) {
        const { message, stack } = error as Error;
        ResponseService({
            data: { message, stack },
            status: 500,
            success: false,
            res
        });
    }
};
