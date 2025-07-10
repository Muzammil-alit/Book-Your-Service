import { NextFunction, Response, Request } from "express";
import { successResponse } from "../utils/response";
import { AuthenticatedRequest } from "../utils/AuthenticatedRequest";
import { CarerService } from "../services/carer.service";
import { CustomError } from "../utils/CustomError";

const carerService = new CarerService();

export const createCarer = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const loggedInUserID = req.user?.userID;
        req.body.createdBy = loggedInUserID || null;
        const profilePic = req.file ? req.file.buffer : undefined;
        if (profilePic) {
            req.body.profilePic = profilePic;
        } else if (req.body.removeProfilePic === 'true') {
            req.body.profilePic = null;
        }
        const carer = await carerService.create(req.body);
        successResponse(res, "Carer created successfully", 200, { carer });
    } catch (error: unknown) {
        next(error);
    }
}



export const getCarers = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const loggedInUserID = req.user?.userID;
        const carers = await carerService.getAll(loggedInUserID!);

        // Format the profile pic if needed
        const formattedCarers = Array.isArray(carers) ? carers.map(carer => ({
            ...carer,
            profilePic: carer.profilePic
                ? `data:image/png;base64,${Buffer.from(carer.profilePic).toString("base64")}`
                : null
        })) : [];

        successResponse(res, "Carers fetched successfully", 200, { carers: formattedCarers });
    } catch (error: unknown) {
        next(error);
    }
};

export const getCarerLookupList = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const loggedInUserID = req.user?.userID;
        const carers = await carerService.getLookupList(loggedInUserID!);
        successResponse(res, "Carers fetched successfully", 200, { carers });
    } catch (error: unknown) {
        next(error);
    }
};

export const updateCarer = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {        
        const loggedInUserID = req.user?.userID;
        req.body.createdBy = loggedInUserID || null;
        // Check if a new profile picture is uploaded
        const profilePic = req.file ? req.file.buffer : undefined;
        const carerID = parseInt(req.params.carerID);

        if (isNaN(carerID)) {
            throw CustomError.badRequest("Invalid carer ID");
        }

        // Add profilePic to req.body only if a new file is uploaded
        if (profilePic) {
            req.body.profilePic = profilePic;
        } else if (req.body.removeProfilePic === 'true') {
            // If the client is explicitly requesting to remove the profile pic
            req.body.profilePic = null;
        }

        // Update carer details
        const [affectedCount, _updatedCarer] = await carerService.update(carerID, req.body);

        if (affectedCount === 0) {
            throw CustomError.badRequest("Carer not found or no changes made");
        }
        successResponse(res, "Carer updated successfully", 200, { carerID });
    } catch (error: unknown) {
        next(error);
    }
};

export const deleteCarer = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const carerID = parseInt(req.params.carerID);
        await carerService.delete(carerID);        
        successResponse(res, "Carer deleted successfully", 200);
    } catch (error: unknown) {
        next(error);
    }
};

export const getCarerServices = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const carerID = parseInt(req.params.carerID);
        const carerServices = await carerService.getCarerServices(carerID)
        successResponse(res, "Carer services fetched successfully", 200, { carerServices });
    } catch (error) {
        next(error);
    }
};

export const updateCarerServices = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const { carerID, serviceIDs } = req.body;
        await carerService.updateCarerServices(carerID, serviceIDs)
        successResponse(res, "Carer service assignments updated successfully", 200);
    } catch (error) {
        next(error);
    }
};

export const getCarerById = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const carerID = parseInt(req.params.carerID); 
        const carer = await carerService.getById(carerID);
        successResponse(res, "Carer fetched successfully", 200, { carer });
    } catch (error) {      
        next(error);
    }
};
