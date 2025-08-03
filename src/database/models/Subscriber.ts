import { Sequelize, Model, DataTypes } from "sequelize";

interface SubscriberAttribute {
    id: string,
    email: string,
    isSubscribed: boolean,
    createdAt?: Date,
    updatedAt?: Date,
}

export interface SubscriberCreationAttribute extends Omit<SubscriberAttribute, 'id'> {
    id?: string;
}

export class Subscriber extends Model<SubscriberAttribute, SubscriberCreationAttribute> implements SubscriberAttribute {
    public id!: string;
    public email!: string;
    public isSubscribed!: boolean;
    public createdAt: Date = new Date;
    public updatedAt!: Date;
    
    public toJSON(): object | SubscriberAttribute {
        return {
            id: this.id,
            email: this.email,
            isSubscribed: this.isSubscribed,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        }
    }
}

export const SubscriberModal = (sequelize: Sequelize) => {
    Subscriber.init({
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true
            }
        },
        isSubscribed: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
            allowNull: false
        },
    }, {
        sequelize,
        timestamps: true,
        modelName: "Subscriber",
        tableName: 'subscribers',
    })
    return Subscriber
}
