import { Router } from "express";
import { 
    toggleLike,
    getBlogLikes
} from "../controller/likeController";
import { ValidationMiddleware } from "../middleware/validationMiddleware";
import { LikeParamsSchema } from '../schemas/likeSchema';
import { authMiddleware } from "../middleware/authMiddleware";

const likeRouter = Router();

// Toggle like on a blog (like/unlike)
likeRouter.post('/blogs/:id/like', 
    ValidationMiddleware({ type: 'params', schema: LikeParamsSchema, refType: 'joi' }),
    authMiddleware, 
    toggleLike
);

likeRouter.get('/blogs/:id/likes', 
    ValidationMiddleware({ type: 'params', schema: LikeParamsSchema, refType: 'joi' }),
    getBlogLikes
);

export { likeRouter };
