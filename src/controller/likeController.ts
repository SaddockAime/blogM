import { Request, Response } from 'express';
import { ResponseService } from "../utils/response";
import { IRequestUser } from '../middleware/authMiddleware';
import { LikeInterface, AddLikeInterface } from '../types/likeInterface';
import { Database } from '../database';

interface IRequestLike extends IRequestUser {
    body: AddLikeInterface;
}

export const toggleLike = async (req: IRequestLike, res: Response) => {
    try {
        const blog = req.params.id;
        const id = req.user?.id as string

        const blogExists = await Database.Blog.findByPk(blog);
        if (!blogExists) {
            return ResponseService({
                data: null,
                success: false,
                message: 'Blog not found',
                status: 404,
                res
            });
        }

        const existingLike = await Database.Like.findOne({ 
            where: { blogId: blog, user: id } 
        });

        if (existingLike) {
            await existingLike.destroy();
            return ResponseService({
                data: null,
                status: 200,
                success: true,
                message: "Blog unliked successfully",
                res
            });
        } else {
            const newLike = await Database.Like.create({
                blogId: blog,
                user: id
            });

            return ResponseService<LikeInterface>({
                data: newLike,
                status: 201,
                success: true,
                message: "Blog liked successfully",
                res
            });
        }
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

export const getBlogLikes = async (req: Request, res: Response) => {
    try {
        const blog = req.params.id;

        const likes = await Database.Like.findAll({
            where: { blogId: blog },
            include: [
                {
                    model: Database.User,
                    as: 'userInfo',
                    attributes: ['id', 'name', 'email']
                }
            ]
        });

        return ResponseService({
            data: { likes, count: likes.length },
            status: 200,
            success: true,
            message: "Likes retrieved successfully",
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
