import { Request, Response, NextFunction } from "express";
import { ResponseService } from "../utils/response";
import { verifyToken } from "../utils/helper";

interface jwtExtendPayload {
    id?: string;
    email?: string;
    role?: string;
    iat?: number;
    exp?: number;
}

export interface IRequestUser extends Request {
    user?: jwtExtendPayload
    token?: string;
}

export const authMiddleware = async (req: IRequestUser, res: Response, next: NextFunction) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return ResponseService({
                data: null,
                status: 401,
                success: false,
                message: "Authentication token is missing",
                res
            });
        }

        const user = await verifyToken(token) as jwtExtendPayload;
        if (!user) {
            return ResponseService({
                data: null,
                status: 401,
                success: false,
                message: "Invalid authentication token",
                res
            });
        }

        req.user = user;
        req.token = token;
        next();
        
    } catch (error) {
        const { message, stack } = error as Error;
        return ResponseService({
            data: { message, stack },
            status: 401,
            success: false,
            message: "Invalid authentication token",
            res
        });
    }
}

export const checkRole = (allowedRoles: string[]) => {
    return (req: IRequestUser, res: Response, next: NextFunction) => {
        try {
            const user = req?.user;

            if (!user || !user.role || !allowedRoles.includes(user.role)) {
                return ResponseService({
                    data: null,
                    status: 403,
                    success: false,
                    message: "You do not have permission to perform this action",
                    res
                });
            }
            
            next();
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
};