import { Request, Response, NextFunction } from "express";
import { CustomError } from "../utils/CustomError";

export function errorMiddleware(error: unknown, _req: Request, res: Response, _next: NextFunction): void {
    let statusCode = 500;
    let errorMessage = "Internal Server Error";

    if (error instanceof CustomError) {
        statusCode = error.statusCode;
        errorMessage = error.message;
    } else if (error instanceof Error) {
        errorMessage = error.message;
    }

    res.status(statusCode).json({
        success: false,
        message: errorMessage,
        status: statusCode,
    });
    return;
};
