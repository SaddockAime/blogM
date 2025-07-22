import { Sequelize, Model, DataTypes } from "sequelize";

interface LikeAttribute {
    id: string;
    user: string;
    blogId: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface LikeCreationAttribute extends Omit<LikeAttribute, 'id'> {
    id?: string;
}

export class Like extends Model<LikeAttribute, LikeCreationAttribute> implements LikeAttribute {
    public id!: string;
    public user!: string;
    public blogId!: string;
    public createdAt!: Date;
    public updatedAt!: Date;

    public association(models: any) {
        Like.belongsTo(models.User, {
            foreignKey: 'user',
            as: 'user'
        });
        
        Like.belongsTo(models.Blog, {
            foreignKey: 'blogId',
            as: 'blog'
        });
    }

    public toJSON(): object | LikeAttribute {
        return {
            id: this.id,
            user: this.user,
            blogId: this.blogId,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }
}

export const LikeModel = (sequelize: Sequelize) => {
    Like.init({
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        user: {
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
        modelName: "Like",
        tableName: 'likes',
        indexes: [
            {
                unique: true,
                fields: ['user', 'blogId'],
                name: 'unique-like'
            }
        ]
    });
    
    return Like;
};
