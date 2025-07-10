import { NextFunction, Request, Response } from "express";
import { successResponse } from "../utils/response";
import { AdminCalendarService } from "../services/adminCalendar.service";
import { AuthenticatedRequest } from "../utils/AuthenticatedRequest";

const adminCalendarService = new AdminCalendarService()

export const getAdminCalendar = async (req: Request, res: Response, next: NextFunction) => {
    try {        
        const data = await adminCalendarService.getAdminCalendar(req.body.carerID, req.body.dateFrom, req.body.dateTo, req.body.bookingType)
        successResponse(res, "Calendar fetched successfully", 200, data);

    } catch (error: unknown) {
        next(error);
    }
};

export const getClientLookupList = async (_req: Request, res: Response, next: NextFunction) => {
    try {
        const data = await adminCalendarService.getClientLookupList()
        successResponse(res, "Clients fetched successfully", 200, data);
    } catch (error: unknown) {
        next(error);
    }
};


export const updateCompletionStatus = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {        
        const operatingUserID = req.user?.userID;
        const data = await adminCalendarService.updateCompletionStatus(req.body, operatingUserID)
        successResponse(res, "Booking status updated successfully", 200, data);
    } catch (error: unknown) {
        next(error);
    }
};

export const getAdminRoster = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const data = await adminCalendarService.getAdminRoster( req.body );
        successResponse(res, "Roster fetched successfully", 200, data);
    } catch (error: unknown) {
        next(error);
    }
};

