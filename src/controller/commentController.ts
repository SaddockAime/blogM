import { Request, Response } from 'express';
import { ResponseService } from "../utils/response";
import { IRequestUser } from '../middleware/authMiddleware';
import { CommentInterface , AddCommentInterface, GetCommentsInterface} from '../types/commentInterface';
import { Database } from '../database';

interface IRequestComment extends IRequestUser {
    body: AddCommentInterface;
}

export const getAllComments = async (req: Request, res: Response) => {
    try {
        const comments = await Database.Comment.findAll({})

        if (!comments || comments.length === 0) {
            return ResponseService({
                data: null,
                status: 404,
                success: false,
                message: "No comments found",
                res
            });
        }

        ResponseService<GetCommentsInterface>({
            data: { comments },
            status: 200,
            success: true,
            message: "Comments retrieved successfully",
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
}

export const addComment = async (req: IRequestComment, res: Response) => {
    try {
        const blogId = req.params.id;
        const { content } = req.body;
        const id = req.user?.id as string

        const blog = await Database.Blog.findByPk(blogId)
        if(!blog) {
            return ResponseService({
                data: null,
                status: 404,
                success: false,
                message: "Blog not found",
                res
            });
        }

        const newComment = await Database.Comment.create({
            content: content,
            author: id,
            blogId: blogId,
            createdAt: new Date(),
        });

        ResponseService<CommentInterface>({
            data: newComment,
            status: 201,
            success: true,
            message: 'Comment added successfully',
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
}