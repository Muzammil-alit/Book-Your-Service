import { NextFunction, Response } from "express";
import { successResponse } from "../utils/response";
import { AuthenticatedRequest } from "../utils/AuthenticatedRequest";
import { CustomError } from "../utils/CustomError";
import { AccountDeleteRequestService } from "../services/deleteRequests.service";

const deleteRequestService = new AccountDeleteRequestService();

export const createDeleteRequest = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const loggedInUserID = req.user?.userID;
        const { clientID, reason } = req.body;

        if (!loggedInUserID) {
            throw CustomError.badRequest("User ID is required");
        }

        if (!clientID) {
            throw CustomError.badRequest("Client ID is required", 400);
        }
        const requestID = await deleteRequestService.createRequest(
            clientID,
            reason,
            loggedInUserID
        );
        successResponse(res, "Delete request created successfully", 200, { requestID });
    } catch (error: unknown) {
        next(error);
    }
};

export const getDeleteRequests = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const { status, dateFrom, dateTo } = req.body;
        const requests = await deleteRequestService.getRequests( status, dateFrom, dateTo);
        successResponse(res, "Delete requests fetched successfully", 200, { requests });
    } catch (error: unknown) {
        next(error);
    }
};

export const updateDeleteRequestStatus = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const loggedInUserID = req.user?.userID;
        const requestID = parseInt(req.params.requestID);
        const { deleteStatus } = req.body;

        if (!loggedInUserID) {
           throw CustomError.badRequest("User ID is required");
        }

        if (!deleteStatus) {
            throw CustomError.badRequest("Status is required");
        }
        await deleteRequestService.updateRequestStatus(
            requestID,
            deleteStatus,
            loggedInUserID
        );
        successResponse(res, "Delete request status updated successfully", 200);
    } catch (error: unknown) {
        next(error);
    }
};

export const getDeleteRequestById = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const requestID = parseInt(req.params.requestID);
        const request = await deleteRequestService.getRequestByID(requestID);
        successResponse(res, "Delete request fetched successfully", 200, { request });
    } catch (error: unknown) {
        next(error);
    }
};

export const getDeleteRequestByClientId = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const clientID = parseInt(req.params.clientID);
        const request = await deleteRequestService.getRequestByClientID(clientID);
        successResponse(res, "Delete request fetched successfully", 200, { request });
    } catch (error: unknown) {
        next(error);
    }
};