// adminDashboard.controller.ts
import { NextFunction, Request, Response } from "express";
import { successResponse } from "../utils/response";
import { AdminDashboardService } from "../services/adminDashboard.service";

const adminDashboardService = new AdminDashboardService();

export const getDashboardHeader = async (_req: Request, res: Response, next: NextFunction) => {
    try {
        const data = await adminDashboardService.getDashboardHeader();
        successResponse(res, "Dashboard header fetched successfully", 200, data);
    } catch (error: unknown) {
        next(error);
    }
};

export const getDashboardActiveCarers = async (_req: Request, res: Response, next: NextFunction) => {
    try {
        const data = await adminDashboardService.getActiveCarers();
        successResponse(res, "Active carers fetched successfully", 200, data);
    } catch (error: unknown) {
        next(error);
    }
};

export const getDashboardInactiveCarers = async (_req: Request, res: Response, next: NextFunction) => {
    try {
        const data = await adminDashboardService.getInactiveCarers();
        successResponse(res, "Inactive carers fetched successfully", 200, data);
    } catch (error: unknown) {
        next(error);
    }
};

export const getDashboardMonthlyBookings = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { dateFrom, dateTo } = req.body;
        const data = await adminDashboardService.getMonthlyBookings(dateFrom, dateTo);
        successResponse(res, "Monthly bookings fetched successfully", 200, data);
    } catch (error: unknown) {
        next(error);
    }
};

export const getDashboardMonthlyBookingsPerService = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { dateFrom, dateTo } = req.body;
        const data = await adminDashboardService.getMonthlyBookingsPerService(dateFrom, dateTo);
        successResponse(res, "Monthly bookings per service fetched successfully", 200, data);
    } catch (error: unknown) {
        next(error);
    }
};

export const getDashboardMonthlyBookingsPerCarer = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { dateFrom, dateTo } = req.body;
        const data = await adminDashboardService.getMonthlyBookingsPerCarer(dateFrom, dateTo);
        successResponse(res, "Monthly bookings per carer fetched successfully", 200, data);
    } catch (error: unknown) {
        next(error);
    }
};


export const getDashboardNotifications = async (_req: Request, res: Response, next: NextFunction) => {
    try {
        const data = await adminDashboardService.getDashboardNotifications();
        successResponse(res, "Dashboard notification fetched successfully", 200, data);
    } catch (error: unknown) {
        next(error);
    }
};

