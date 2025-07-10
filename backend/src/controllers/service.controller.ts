import { NextFunction, Response, Request } from "express";
import { successResponse } from "../utils/response";
import { AuthenticatedRequest } from "../utils/AuthenticatedRequest";
// import { CustomError } from "../utils/CustomError";
import { ServiceService } from "../services/service.service";

const serviceService = new ServiceService();

export const createService = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const loggedInUserID = req.user?.userID;        
        await serviceService.createUpdate(req.body, loggedInUserID);
        successResponse(res, "Service created successfully", 200);
    } catch (error: unknown) {
        next(error);
    }
};

export const getServices = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const serviceID = req?.params?.serviceID
        const services = await serviceService.get(serviceID);
        successResponse(res, "Services fetched successfully", 200, { services });
    } catch (error: unknown) {
        next(error);
    }
};

export const getServiceLookupList = async (_req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const services = await serviceService.getLookupList();
        successResponse(res, "Services fetched successfully", 200, { services });
    } catch (error: unknown) {
        next(error);
    }
};

export const updateService = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const serviceID = parseInt(req?.params?.serviceID)
        const loggedInUserID = req.user?.userID
        const service = await serviceService.createUpdate(req.body, loggedInUserID, serviceID);
        successResponse(res, "Service updated successfully", 200, { service });
    } catch (error: unknown) {
        next(error);
    }
};

export const deleteService = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const serviceID = parseInt(req.params.serviceID);
        await serviceService.delete(serviceID);
        successResponse(res, "Service deleted successfully", 200);
    } catch (error: unknown) {
        next(error);
    }
};





export const updateServiceCarers = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {

        
        const { serviceID, carerIDs } = req.body;

        const service = await serviceService.updateServiceCarers( serviceID, carerIDs );

        successResponse(res, "Service updated successfully", service);

    } catch (error: unknown) {
        next(error);
    }

};

export const getServiceCarers = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const serviceID = parseInt(req?.params?.serviceID)
        const serviceCarers = await serviceService.getServiceCarers(serviceID);

        successResponse(res, "Service Carers fetched successfully", 200, { serviceCarers });

    } catch (error: unknown) {
        next(error);
    }
};



export const getServiceById = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const serviceID = parseInt(req?.params?.serviceID)
        const service = await serviceService.getServiceByID(serviceID);

        successResponse(res, "Service fetched successfully", 200, { service });

    } catch (error: unknown) {
        next(error);
    }
};