export interface SubscriberInterface {
    id: string;
    email: string;
    isSubscribed: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface AddSubscriberInterface extends Omit<SubscriberInterface, 'id' | 'isSubscribed' | 'createdAt' | 'updatedAt'> {}

export interface SubscriberListInterface {
    subscribers: SubscriberInterface[];
    pagination: {
        currentPage: number;
        totalPages: number;
        totalSubscribers: number;
        limit: number;
    };
}
