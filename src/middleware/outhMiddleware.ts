import { Request, Response, NextFunction } from "express";
import { User } from "../database/models/User";
import { generateToken } from "../utils/helper";
import { ResponseService } from "../utils/response";

export interface IRequestUser extends Request {
    token?: string;
    user?: any;
}

export const generateOAuthToken = async (req: IRequestUser, res: Response, next: NextFunction) => {
    try {
        const user = req.user as any;

        if (!user) {
            return ResponseService({
                data: null,
                status: 401,
                success: false,
                message: "User not found",
                res
            });
        }

        const token = await generateToken({
          id: user.id,
          email: user.email,
          role: user.role,
        });

        req.token = token;
        req.user = {
          id: user.id,
          name: user.name,
          email: user.email,
          profilePicture: user.profilePicture,
          role: user.role,
          provider: user.provider,
        };
        
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

export const handleOAuthUser = async (accessToken: string, refreshToken: string, profile: any, done: any) => {
    try {
        let existingUser = await User.findOne({
            where: { googleId: profile.id }
        });

        if (existingUser) {
            return done(null, existingUser);
        }

        existingUser = await User.findOne({
            where: { email: profile.emails![0].value } 
        });

        if (existingUser) {
            existingUser.googleId = profile.id;
            existingUser.profilePicture = profile.photos![0].value;
            existingUser.provider = 'google';
            await existingUser.save();
            return done(null, existingUser);
        }

        const newUser = await User.create({
            googleId: profile.id,
            name: profile.displayName,
            email: profile.emails![0].value,
            profilePicture: profile.photos![0].value,
            provider: 'google',
            gender: 'other',
            role: 'user'
        });

        return done(null, newUser);
    } catch (error) {
        return done(error, false);
    }
};

export const handleOAuthCallback = (req: IRequestUser, res: Response, next: NextFunction) => {
    try {
        const token = req.token;
        const user = req.user;

        if (!token || !user) {
          return ResponseService({
            data: null,
            status: 400,
            success: false,
            message: "Token generation failed",
            res,
          });
        }

        return ResponseService({
          data: token,
          status: 200,
          success: true,
          message: "Login successful",
          res,
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