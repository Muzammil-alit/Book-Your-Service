import { NextFunction, Request, Response } from "express";
import { successResponse } from "../utils/response";
import { ClientBookingService } from "../services/clientBookingService";
import { AuthenticatedRequest } from "../utils/AuthenticatedRequest";

const clientBookingService = new ClientBookingService()

export const getClientServices = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await clientBookingService.getClientServices();
    successResponse(res, "Client services fetched successfully", 200, data);
  } catch (error: unknown) {
    next(error);
  }
};

export const getAvailableBookingDates = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await clientBookingService.getAvailableBookingDates(req.body.serviceID, req.body.bookingID);
    successResponse(res, "Available booking dates fetched successfully", 200, data);
  } catch (error: unknown) {
    next(error);
  }
};

export const getAvailableBookingTimeSlots = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await clientBookingService.getAvailableBookingTimeSlots(req.body.serviceID, req.body.serviceDurationID, req.body.bookingDate, req.body.bookingID);
    successResponse(res, "Available booking time slots fetched successfully", 200, data);
  } catch (error: unknown) {
    next(error);
  }
};

export const getClientCarer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await clientBookingService.getClientCarer(req.body.serviceID, req.body.duration, req.body.bookingDateTime, req.body.bookingID);
    successResponse(res, "Availanle carers fetched successfully", 200, data);
  } catch (error: unknown) {
    next(error);
  }
};


export const insertBooking = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {    
    const loggedInUserID = req.user?.userID;    
    const data = await clientBookingService.insertBooking( loggedInUserID, req.body.bookingData);
    successResponse(res, "Bookings created successfully", 200, data);
  } catch (error: unknown) {
    next(error);
  }
};


export const getBookingList = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {       
    const clientID = parseInt(req.params.clientID) || null
    const data = await clientBookingService.getBookingList(clientID, req.body.bookingStatus, req.body.dateFrom, req.body.dateTo, req.body.bookingType);
    successResponse(res, "Bookings fetched successfully", 200, data);
  } catch (error: unknown) {
    next(error);
  }
};


export const deleteBooking = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const bookingID = parseInt(req.params.bookingID);  
    await clientBookingService.deleteBooking(bookingID);
    successResponse(res, "Booking deleted successfully", 200);
  } catch (error: unknown) {
    next(error);
  }
}; 

export const updateBooking = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const bookingData = req.body[0];
    const loggedInUserID = req.user?.userID;
    const data = await clientBookingService.updateBooking(loggedInUserID, bookingData);
    successResponse(res, "Booking updated successfully", 200, data);
  } catch (error: unknown) {
    next(error);
  }
}

export const getBookingbyid = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {    
    const bookingID = parseInt(req.params.bookingID)
    const data = await clientBookingService.getBookingById(bookingID);
    successResponse(res, "Booking fetched successfully", 200, data);
  } catch (error: unknown) {
    next(error);
  }
};

