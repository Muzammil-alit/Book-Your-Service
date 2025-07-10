import { Request } from "express";

export interface AuthenticatedRequest extends Request {
  user?: {
    userID: number;
    emailID: string;
    firstName: string;
    lastName: string;
  };
}