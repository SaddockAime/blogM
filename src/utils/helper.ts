import { config } from "dotenv"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

config()

export const generateSlug = (title: string): string => {
    return title.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-')
}

export const hashPassword = async (password: string): Promise<string> => {
    return await bcrypt.hash(password, 10);
}

export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
    return await bcrypt.compare(password, hash);
}

export const secretKey = process.env.JWT_SECRET || "SecretKey";

export const generateToken = ({id, email, role}: { id: string; email: string; role: string }): string => {
    return jwt.sign({ id, email, role }, secretKey, { expiresIn: '5h' });
}