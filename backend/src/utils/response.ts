import { Response } from 'express';

export const successResponse = (res: Response, message: string, status: number = 200, data = {}) => {
    return res.status(status).json({ sucess: true, message, data });
}

export const errorResponse = (res: Response, message: string, status: number = 500, error: unknown = null) => {
    return res.status(status).json({ succces: false, message, error });
}