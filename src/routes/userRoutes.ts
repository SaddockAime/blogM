import { Router } from "express";
import { addUser, loginUser } from "../controller/userController";
import { ValidationMiddleware } from "../middleware/validationMiddleware";
import { AddUserSchema, LoginUserSchema } from '../schemas/userSchema';

const userRouter = Router();

userRouter.post('/users', 
    ValidationMiddleware({ type: 'body', schema: AddUserSchema, refType: 'joi' }),
    addUser
);

userRouter.post('/login', 
    ValidationMiddleware({ type: 'body', schema: LoginUserSchema, refType: 'joi' }),
    loginUser
);
export { userRouter };