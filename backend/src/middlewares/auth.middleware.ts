import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import jwtConfig from "../config/jwtConfig";
import { AuthenticatedRequest } from "../utils/AuthenticatedRequest";
import { CustomError } from "../utils/CustomError";

interface DecodedToken {
    userID: number;
    emailID: string;
    firstName: string;
    lastName: string;
}

function authMiddleware(req: Request, _res: Response, next: NextFunction): void {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
        throw CustomError.unauthorized("Unauthorized Access");
    }
    else {
        try {
            const decoded = jwt.verify(token, jwtConfig.jwtSecret) as DecodedToken;
            (req as AuthenticatedRequest).user = decoded;
            next();
        } catch (error) {
            throw CustomError.unauthorized("Invalid token");
        }
    }
};

export default authMiddleware;
