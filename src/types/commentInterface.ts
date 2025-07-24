export interface CommentInterface {
    content: string;
    author: string;
    blogId: string;
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date | null;
}

export interface AddCommentInterface extends Omit<CommentInterface, 'createdAt' | 'updatedAt' | 'deletedAt'> {}
export interface GetCommentsInterface {
    comments: CommentInterface[];
}