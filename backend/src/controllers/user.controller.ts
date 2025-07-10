import { NextFunction, Response } from 'express';
import { UserService } from '../services/user.service';
import { successResponse } from '../utils/response';
import { AuthenticatedRequest } from '../utils/AuthenticatedRequest';
import { CustomError } from '../utils/CustomError';

const userService = new UserService();

export const createUser = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const loggedInUserID = req.user?.userID;
    req.body.createdBy = loggedInUserID || null;
    const user = await userService.createUser(req.body);
    successResponse(res, 'User created successfully', 200, { userID: user.userID });
  } catch (error: unknown) {
    next(error);
  }
};

export const getUserList = async (
  _req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const users = await userService.getUserList();
    successResponse(res, 'Users fetched successfully', 200, { users });
  } catch (error: unknown) {
    next(error);
  }
};

export const getUsersLookupList = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const loggedInUserID = req.user?.userID;
    const users = await userService.getUsersLookupList(loggedInUserID!);
    successResponse(res, 'Users fetched successfully', 200, { users });
  } catch (error: unknown) {
    next(error);
  }
};

export const getUserById = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userID = parseInt(req?.params?.userID);
    const user = await userService.getUserById(userID);
    if (!user) {
      throw CustomError.badRequest('User not found');
    }
    successResponse(res, 'User fetched successfully', 200, { user });
  } catch (error: unknown) {
    next(error);
  }
};

export const updateUser = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userID = parseInt(req.params.userID);
    const loggedInUserID = req.user?.userID;
    await userService.updateUser(userID, req.body, loggedInUserID!);
    successResponse(res, 'User updated successfully', 200);
  } catch (error: unknown) {
    next(error);
  }
};

export const deleteUser = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userID = parseInt(req.params.userID);
    const loggedInUserID = req.user?.userID;
    await userService.deleteUser(userID, loggedInUserID!);
    successResponse(res, 'User deleted successfully', 200);
  } catch (error: unknown) {
    next(error);
  }
};

export const changePassword = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userID = req?.user?.userID;
    const { currentPassword, newPassword } = req.body;
    await userService.changePassword(userID, currentPassword, newPassword);
    successResponse(res, 'Password changed successfully', 200);
  } catch (error: unknown) {
    next(error);
  }
};

export const updateProfile = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userID = req.body.userID;
    if (!userID) {
      throw CustomError.badRequest('User not authenticated');
    }
    const updatedUser = await userService.updateProfile(userID, req.body);
    if (!updatedUser) {
      throw CustomError.badRequest('User not found');
    }
    successResponse(res, 'Profile updated successfully', 200, { user: updatedUser });
  } catch (error: unknown) {
    next(error);
  }
};
