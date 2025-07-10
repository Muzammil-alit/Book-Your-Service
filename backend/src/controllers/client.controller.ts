import { NextFunction, Request, Response } from "express";
import { successResponse } from "../utils/response";
import { ClientService } from "../services/client.service";

import { AuthenticatedRequest } from "../utils/AuthenticatedRequest";

const clientService = new ClientService()

export const getClientList = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const clientID = parseInt(req.params.clientID)
    const data = await clientService.getClientList(clientID);
    successResponse(res, "Clients fetched successfully", 200, data);
  } catch (error: unknown) {
    next(error);
  }
};

export const getClientByID = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const clientID = parseInt(req.params.clientID)
    const data = await clientService.getClientByID(clientID);
    successResponse(res, "Client fetched successfully", 200, data);
  } catch (error: unknown) {
    next(error);
  }
};


export const updateClientByID = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const clientID = parseInt(req?.params?.clientID)
    const loggedInUserID = req?.user?.userID
    const data = await clientService.updateClient(clientID, req.body, loggedInUserID);
    successResponse(res, "Client updated successfully", 200, data);
  } catch (error: unknown) {
    next(error);
  }
};
