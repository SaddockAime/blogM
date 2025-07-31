
export interface LikeInterface {
    id: string;
    user: string;
    blogId: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface AddLikeInterface extends Omit<LikeInterface, 'id' | 'createdAt' | 'updatedAt'> {}
export interface GetLikesInterface {
    likes: LikeInterface[];
}