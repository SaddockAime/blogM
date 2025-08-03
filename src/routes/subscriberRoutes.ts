import { Router } from "express";
import {
    subscribe,
    unsubscribe,
    getAllSubscribers
} from "../controller/subscriberController";
import { authMiddleware, checkRole } from "../middleware/authMiddleware";
import { ValidationMiddleware } from "../middleware/validationMiddleware";
import {
    SubscribeSchema
} from "../schemas/subscriberSchema";

const subscriberRouter = Router();

subscriberRouter.post('/subscribers/subscribe', 
    ValidationMiddleware({ type: 'body', schema: SubscribeSchema, refType: 'joi' }),
    subscribe
);

subscriberRouter.get('/subscribers/unsubscribe', unsubscribe);

subscriberRouter.get('/subscribers', authMiddleware, checkRole(['admin']), getAllSubscribers);

export { subscriberRouter };
