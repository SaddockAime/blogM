import { Request, Response } from "express";
import { ResponseService } from "../utils/response";
import { AddUserInterface, UserInterface } from "../types/userInterface";
import { Database } from "../database";
import { hashPassword, comparePassword, generateToken } from "../utils/helper";

interface IRequestUser extends Request {
    body: AddUserInterface;
}


export const addUser = async (req: IRequestUser, res: Response) => {
    try {
        const { name, email, password, gender } = req.body;

        const userExists = await Database.User.findOne({ where: { email } });
        if (userExists) {
            return ResponseService({
                data: null,
                status: 409,
                success: false,
                message: "User already exists",
                res
            });
        }

        const newUser = await Database.User.create({
            name,
            email,
            password: await hashPassword(password),
            gender,
        })
        ResponseService<UserInterface>({
            data: newUser,
            status: 201,
            success: true,
            message: 'User added successfully',
            res
        });
    } catch (err) {
        const { message, stack } = err as Error;
        console.error('Error creating user:', { message, stack });
        
        ResponseService({
            data: { message, stack },
            status: 500,
            success: false,
            res
        });
    }
}

export const loginUser = async (req: IRequestUser, res: Response) => {
    try {
        const { email, password } = req.body;

        
        const user = await Database.User.findOne({ where: { email } });
        if (!user) {
            return ResponseService({
                data: null,
                status: 404,
                success: false,
                message: "User not found",
                res
            });
        }

        const validPassword = await comparePassword(password, user.password);
        if (!validPassword) {
            return ResponseService({
                data: null,
                status: 401,
                success: false,
                message: "Invalid email or password",
                res
            });
        }

        const token = generateToken({ id: user.id, email: user.email, role: user.role });

        ResponseService({
            data: { token },
            status: 200,
            success: true,
            message: "Login successful",
            res
        });
    } catch (err) {
        const { message, stack } = err as Error;
        console.error('Error logging in user:', { message, stack });

        ResponseService({
            data: { message, stack },
            status: 500,
            success: false,
            res
        });
    }
}