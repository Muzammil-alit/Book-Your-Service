import { NextFunction, Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { successResponse } from '../utils/response';

const authService = new AuthService();

export const loginUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await authService.loginUser(
      req.body.emailID,
      req.body.password,
      req.body.userType,
    );
    successResponse(res, 'Login successful', 200, data);
  } catch (error: unknown) {
    next(error);
  }
};

export const registerClient = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await authService.registerClient(req.body);
    successResponse(res, 'Registration successful', 200);
  } catch (error: unknown) {
    next(error);
  }
};

export const generateResetPasswordCode = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await authService.generateResetPasswordCode(req.body.emailID);
    successResponse(res, 'Reset code generated successfully', 200, result);
  } catch (error: unknown) {
    next(error);
  }
};

export const validateResetPasswordCode = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { resetPasswordCode } = req.body;

    const result = await authService.validateResetPasswordCode(resetPasswordCode);

    successResponse(res, 'Reset code validated successfully', 200, result);
  } catch (error: unknown) {
    next(error);
  }
};

export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { resetPasswordCode, newPassword } = req.body;
    const result = await authService.resetPassword(resetPasswordCode, newPassword);
    successResponse(res, 'Password reset successfully', 200, result);
  } catch (error: unknown) {
    next(error);
  }
};
