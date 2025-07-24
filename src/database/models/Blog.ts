import { Sequelize, Model, DataTypes } from "sequelize";
import { User } from "./User";
import { Like } from "./Like";
import { Comment } from "./Comment";

interface BlogAttribute {
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

export interface BlogCreationAttribute extends Omit<BlogAttribute, 'id'> {
    id?: string;
}

export class Blog extends Model<BlogAttribute, BlogCreationAttribute> implements BlogAttribute {
    public id!: string;
    public title!: string;
    public slug!: string;
    public description!: string;
    public content!: string;
    public blog_image_url!: string;
    public author!: string;
    public isPublished!: boolean;
    public createdAt!: Date;
    public updatedAt!: Date;
    public deletedAt?: Date | null;
    public comments?: typeof Comment[];
    public likes?: typeof Like[];

    static associate(models: { User: typeof User, Comment: typeof Comment, Like: typeof Like }) {
        Blog.belongsTo(models.User, {
            foreignKey: 'author',
            as: 'authorUser'
        });

        Blog.hasMany(models.Comment, {
            foreignKey: 'blogId',
            as: 'comments'
        });
        
        Blog.hasMany(models.Like, {
            foreignKey: 'blogId',
            as: 'likes'
        });
    }

    public toJSON(): object | BlogAttribute {
        const values = Object.assign({}, this.get());
        return values;
    }
}

export const BlogModel = (sequelize: Sequelize) => {
    Blog.init({
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false
        },
        slug: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        content: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        blog_image_url: {
            type: DataTypes.STRING,
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
        isPublished: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        }
    }, {
        sequelize,
        timestamps: true,
        paranoid: true,
        modelName: "Blog",
        tableName: 'blogs',
    });
    
    return Blog;
};
