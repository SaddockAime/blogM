
export interface BlogInterface{
    id: string;
    title: string;
    slug: string;
    description: string;
    content: string;
    blog_image_url: string;
    author: string;
    isPublished: boolean;
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date | null;
    comments?: any[];
    likes?: any[];
}
export interface interfaceAddBlog extends Omit<BlogInterface,'id' | 'createdAt' | 'updatedAt'>{}
export interface GetAllBlogs{
    blogs:BlogInterface[]
}