import { NextFunction, Request, Response } from "express";
import { successResponse } from "../utils/response";
import { AdminBookingService } from "../services/adminBooking.service";

const adminBookingService = new AdminBookingService();

export const updateBookingStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const BookingID = parseInt(req.params.BookingID);        
        const data = await adminBookingService.updateBookingStatus(BookingID, req.body)
        successResponse(res, "Booking status updated successfully", 200, data);
    } catch (error: unknown) {
        next(error);
    }
};