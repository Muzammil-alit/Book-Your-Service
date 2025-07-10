import { NextFunction, Request, Response } from "express";
import { ActivityLogService } from "../services/activityLog.service";
import { successResponse } from "../utils/response";

const activityLogService = new ActivityLogService();



export const getActivityLogs = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userID, dateFrom, dateTo } = req.query;
        const logs = await activityLogService.getActivityLogs(
            userID ? Number(userID) : undefined,
            dateFrom as string,
            dateTo as string
        );
        successResponse(res, "Logs fetched successfully", 200, { ...logs });
    } catch (error) {
        next(error);
    }
};


