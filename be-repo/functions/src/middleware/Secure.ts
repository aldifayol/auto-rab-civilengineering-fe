import { Request, Response, NextFunction } from "express";
import jwt, { JsonWebTokenError, JwtPayload } from "jsonwebtoken";
import dotenv from "dotenv";
import { ResponseData } from "../utils/Response";
import { PayloadJwt } from "../Interface/PayloadInterface";

dotenv.config();

// Extend Request interface to include user property
// interface AuthenticatedRequest extends Request {
//     user?: JwtPayload;
// }

export class Secure {
    // Middleware to protect routes
    static async authenticateToken(req: Request, res: Response, next: NextFunction): Promise<void | Response> {
        try {
            const authHeader = req.headers['authorization'];
            const token = authHeader && authHeader.split(' ')[1];

            if (!token) {
                return res.status(401).json(await ResponseData.errors(false, 401, 'Token is missing, please provide a token!'));
            }

            const payload = await Secure.verifyToken(token!, res);

            if (!payload) {
                return; // Error response will have already been sent
            }

            req.user = payload; // Set the user in the request
            next(); // Pass control to the next middleware
        } catch (error) {
            console.error('Error in authentication:', error);
            res.sendStatus(500); // Internal Server Error
        }
    }

    // Function to verify a JWT token
    static async verifyToken(token: string, res: Response): Promise<PayloadJwt | null> {
        try {
            const decoded = jwt.verify(token, process.env.SECRET_KEY!) as PayloadJwt;
            return decoded;
        } catch (err: any) {
            console.error('Token verification failed:', err);

            if (err instanceof jwt.TokenExpiredError) {
                res.status(401).json(await ResponseData.errors(false, 401, 'Token has expired, please log in again!'));
            } else if (err instanceof jwt.JsonWebTokenError) {
                res.status(401).json(await ResponseData.errors(false, 401, 'Invalid token!'));
            } else {
                res.sendStatus(500); // Internal Server Error for unexpected errors
            }

            return null; // Return null in case of error
        }
    }
}
