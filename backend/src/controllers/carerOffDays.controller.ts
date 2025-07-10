import { NextFunction, Response } from "express";
import { successResponse } from "../utils/response";
import { AuthenticatedRequest } from "../utils/AuthenticatedRequest";
import { CarerOffDayService } from "../services/carerOffDayService";
import { CustomError } from "../utils/CustomError";

const carerOffDayService = new CarerOffDayService();

export const getCarerOffDays = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const carerID = parseInt(req.params.carerID);        
        const offDays = await carerOffDayService.getListByCarerID(carerID);        
        successResponse(res, "Carer off days fetched successfully", 200, { offDays });
    } catch (error: unknown) {
        next(error);
    }
};

export const createCarerOffDays = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const { carerID, dateFrom, dateTo } = req.body;
        const operatingUserID = req.user?.userID;

        if (!carerID || !dateFrom || !dateTo) {
            throw CustomError.badRequest("Missing required fields");
        }
        await carerOffDayService.create(
            carerID, 
            new Date(dateFrom), 
            new Date(dateTo), 
            operatingUserID!
        );
        successResponse(res, "Carer off days created successfully", 201);
    } catch (error: unknown) {
        next(error);
    }
};

export const updateCarerOffDayById = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const { carerOffDayID, dateFrom, dateTo } = req.body;
        const operatingUserID = req.user?.userID;
        if (!carerOffDayID || !dateFrom || !dateTo) {
            throw CustomError.badRequest("Missing required fields");
        }
        await carerOffDayService.update(
            carerOffDayID,
            new Date(dateFrom),
            new Date(dateTo),
            operatingUserID!
        );
        successResponse(res, "Carer off day updated successfully", 200);
    } catch (error: unknown) {
        next(error);
    }
};

export const deleteCarerOffDay = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const { carerOffDayID } = req.body;
        
        await carerOffDayService.delete(carerOffDayID);
        successResponse(res, "Carer off day deleted successfully", 200);
    } catch (error: unknown) {
        next(error);
    }
};

export const updateByoffDays = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const { carerID, offDays } = req.body;
        const operatingUserID = req.user?.userID;

        await carerOffDayService.updateCarerOffDays(
            carerID,
            offDays,
            operatingUserID!
        );
        successResponse(res, "Carer off days calendar updated successfully", 200);
    } catch (error: unknown) {
        next(error);
    }
};