import { Request, Response } from 'express';
import { ResponseService } from "../utils/response";
import { GetAllBlogs, interfaceAddBlog, BlogInterface } from '../types/blogInterface';
import { Database } from '../database';
import { generateSlug } from '../utils/helper';
import { IRequestUser } from '../middleware/authMiddleware';
import { uploadFile } from '../utils/upload';


interface IRequestBlog extends IRequestUser {
    body: interfaceAddBlog;
}

export const getAllBlogs = async (req: Request, res: Response) => {
    try {
       
        const blogs = await Database.Blog.findAll({
            include: [
                {
                    model: Database.User,
                    as: 'authorUser',
                    attributes: ['id', 'name']
                },
                {
                    model: Database.Comment,
                    as: 'comments',
                    attributes: ['author', 'content'],
                    include: [
                        {
                            model: Database.User,
                            as: 'authorUser',
                            attributes: ['id', 'name']
                        }
                    ]
                },
                {
                    model: Database.Like,
                    as: 'likes',
                    include: [
                        {
                            model: Database.User,
                            as: 'userInfo',
                            attributes: ['id', 'name']
                        }
                    ]
                }
            ]
        })

        if (!blogs || blogs.length === 0) {
            return ResponseService({
                data: null,
                status: 404,
                success: false,
                message: "No blogs found",
                res
            });
        }

        ResponseService<GetAllBlogs>({
            data: { blogs },
            status: 200,
            success: true,
            message: "Blogs retrieved successfully",
            res
        });
    } catch (err) {
        const { message, stack } = err as Error;
        ResponseService({
            data: { message, stack },
            status: 500,
            success: false,
            res
        });
    }
};

export const getBlog = async (req: Request, res: Response) => {
    try {
        const blog = await Database.Blog.findByPk(req.params.id, {
            include: [
                {
                    model: Database.User,
                    as: 'authorUser',
                    attributes: ['id', 'name']
                },
                {
                    model: Database.Comment,
                    as: 'comments',
                    attributes: ['author', 'content'],
                    include: [
                        {
                            model: Database.User,
                            as: 'authorUser',
                            attributes: ['id', 'name']
                        }
                    ]
                },
                {
                    model: Database.Like,
                    as: 'likes',
                    include: [
                        {
                            model: Database.User,
                            as: 'userInfo',
                            attributes: ['id', 'name']
                        }
                    ]
                }
            ]
        });

        if(!blog) {
            return ResponseService({
                data: null,
                status: 404,
                success: false,
                message: "Blog not found",
                res
            });
        }

        ResponseService<BlogInterface>({
            data: blog as any,
            status: 200,
            success: true,
            message: "Blog retrieved successfully",
            res
        });
    } catch (err) {
        const { message, stack } = err as Error;
        ResponseService({
            data: { message, stack },
            status: 500,
            success: false,
            res
        });
    }
};

export const createBlog = async (req: IRequestBlog, res: Response) => {
    try {
        const { file } = req;
        
        const id = req.user?.id as string;
        const author = await Database.User.findByPk(id);
       
        const { title, description, isPublished, content } = req.body;

        let image_url: string = '';
        
        if (file) {
            try {
              image_url = await uploadFile(file as Express.Multer.File);
            } catch (err) {
              const { message, stack } = err as Error;
              ResponseService({
                data: { message, stack },
                status: 500,
                success: false,
                res,
              });
            }
        }
        const slug = generateSlug(title);
        const existingBlog = await Database.Blog.findOne({ where: { slug } });
        if (existingBlog) {
            return ResponseService({
                data: null,
                status: 400,
                success: false,
                message: "A blog with this title already exists. Please use a different title.",
                res
            });
        }

        const newBlog = await Database.Blog.create({
            title,
            description,
            isPublished,
            content,
            slug,
            author: id,
            blog_image_url: image_url
        });

        // Include author information in the response for the notification middleware
        const blogWithAuthor = {
            ...newBlog.toJSON(),
            authorUser: author ? { name: author.name } : null
        };
        
        ResponseService({
            data: blogWithAuthor,
            status: 201,
            success: true,
            message: "Blog created successfully",
            res
        });
    } catch (err) {
        const { message, stack } = err as Error;
        ResponseService({
            data: { message, stack },
            status: 500,
            success: false,
            res
        });
    }
};

export const updateBlog = async (req: Request, res: Response) => {
    try {
        const [updatedCount] = await Database.Blog.update(req.body, {
            where: { id: req.params.id }
        });

        if (updatedCount === 0) {
            return ResponseService({
                data: null,
                status: 404,
                success: false,
                message: "Blog not found",
                res
            });
        }

        const updateBlog = await Database.Blog.findByPk(req.params.id);

        ResponseService<BlogInterface>({
            data: updateBlog as any,
            status: 200,
            success: true,
            message: "Blog updated successfully",
            res
        });
    } catch (err) {
        const { message, stack } = err as Error;
        ResponseService({
            data: { message, stack },
            status: 500,
            success: false,
            res
        });
    }
};

export const deleteBlog = async (req: Request, res: Response) => {
    try {
        const blog = await Database.Blog.findByPk(req.params.id);

        if (!blog) {
            return ResponseService({
                data: null,
                status: 404,
                success: false,
                message: "Blog not found",
                res
            });
        }

        await Database.Blog.destroy({
            where: { id: req.params.id }
        });

        ResponseService<BlogInterface>({
            data: blog as any,
            status: 200,
            success: true,
            message: "Blog deleted successfully",
            res
        });
    } catch (err) {
        const { message, stack } = err as Error;
        ResponseService({
            data: { message, stack },
            status: 500,
            success: false,
            res
        });
    }
};
