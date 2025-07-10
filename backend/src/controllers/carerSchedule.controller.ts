import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../utils/AuthenticatedRequest";
import { CarerScheduleService } from "../services/carerSchedule.service";
import { successResponse } from "../utils/response";
import { CustomError } from "../utils/CustomError";

const carerScheduleService = new CarerScheduleService();

export const getCarerWeeklySchedule = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const carerID = parseInt(req.params.carerID)
    const schedule = await carerScheduleService.getCarerWeeklySchedule(carerID);
    successResponse(res, "Carer weekly schedule fetched successfully", 200, {
      schedule,
    });
  } catch (error) {
    next(error);
  }
};




export const updateCarerWeeklySchedule = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const carerID = parseInt(req.params.carerID);
    const { scheduleData } = req.body;

    await carerScheduleService.updateCarerWeeklySchedule(carerID, scheduleData);
    successResponse(res, "Carer weekly schedule updated successfully", 200)
  } catch (error) {
    next(error);
  }
}

export const deleteCarerWeeklyScheduleDay = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const carerID = parseInt(req.params.carerID);
    const weekday = parseInt(req.params.weekday);

    if (isNaN(carerID)) {
      throw CustomError.badRequest("Invalid carer ID");
    }

    if (isNaN(weekday) || weekday < 0 || weekday > 6) {
      throw CustomError.badRequest("Invalid weekday (must be 0-6)");
    }

    const deleted = await carerScheduleService.deleteCarerWeeklyScheduleDay(
      carerID,
      weekday
    );

    if (deleted) {
      successResponse(
        res,
        "Carer weekly schedule day deleted successfully",
        200
      );
    } else {
      throw CustomError.badRequest("Schedule day not found");
    }
  } catch (error) {
    next(error);
  }
};
