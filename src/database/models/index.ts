import { UserModal, User } from "./User";
import { BlogModel, Blog } from "./Blog";
import { CommentModel, Comment } from "./Comment";
import { LikeModel, Like } from "./Like";
import { Sequelize } from "sequelize";
interface Modals {
    User: typeof User
    Blog: typeof Blog
    Comment: typeof Comment
    Like: typeof Like
}
export const AllModal = (sequelize: Sequelize): Modals => {
    return {
        User: UserModal(sequelize),
        Blog: BlogModel(sequelize),
        Comment: CommentModel(sequelize),
        Like: LikeModel(sequelize)
    }
}