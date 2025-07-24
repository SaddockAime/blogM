
export interface UserInterface {
    name: string;
    email: string;
    password: string;
    role: "admin" | "user";
    gender: "male" | "female" | "other";
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: null;
}

export interface AddUserInterface extends Omit<UserInterface, 'createdAt' | 'updatedAt'> {}
