import { Sequelize, Model, DataTypes } from "sequelize";

interface CommentAttribute {
    id: string;
    content: string;
    author: string;
    blogId: string;
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date | null;
}

export interface CommentCreationAttribute extends Omit<CommentAttribute, 'id'> {
    id?: string;
}

export class Comment extends Model<CommentAttribute, CommentCreationAttribute> implements CommentAttribute {
    public id!: string;
    public content!: string;
    public author!: string;
    public blogId!: string;
    public createdAt!: Date;
    public updatedAt!: Date;
    public deletedAt?: Date | null;

    public association(models: any) {
        Comment.belongsTo(models.User, {
            foreignKey: 'author',
            as: 'author'
        });
        
        Comment.belongsTo(models.Blog, {
            foreignKey: 'blogId',
            as: 'blog'
        });
    }

    public toJSON(): object | CommentAttribute {
        return {
            id: this.id,
            content: this.content,
            author: this.author,
            blogId: this.blogId,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
            deletedAt: this.deletedAt
        };
    }
}

export const CommentModel = (sequelize: Sequelize) => {
    Comment.init({
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        content: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        author: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id'
            }
        },
        blogId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'blogs',
                key: 'id'
            }
        }
    }, {
        sequelize,
        timestamps: true,
        paranoid: true,
        modelName: "Comment",
        tableName: 'comments',
    });
    
    return Comment;
};
