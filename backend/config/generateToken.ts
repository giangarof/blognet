import type { Response } from 'express';
import jwt from 'jsonwebtoken';


export const generateToken = (res: Response, user: any) => {
    
    const JWT_SECRET = process.env.JWT_SECRET!; 
    if (!JWT_SECRET) {
        throw new Error("JWT_SECRET is not defined in environment variables");
    }
    
    const token = jwt.sign({user: user.id, is_admin: user.is_admin }, JWT_SECRET, {
        expiresIn: '30d'
    });

    // setjwt as http only cookie
    res.cookie('jwt', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV !== 'development',
        sameSite: "strict",
        maxAge: 30 * 24 *  60 * 60 * 1000 //30 days
    });

}