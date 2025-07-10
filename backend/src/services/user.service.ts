import { UserRepository } from '../repositories/user.repository';
import { CustomError } from '../utils/CustomError';
import { handleServiceError } from '../utils/handleDBError';

const userRepository = new UserRepository();

export class UserService {
  async createUser(userData: any) {
    try {
      return userRepository.createUser({
        ...userData,
      });
    } catch (error: any) {
      handleServiceError(error, 'create user');
    }
  }

  async getUserList() {
    try {
      return userRepository.getUserList();
    } catch (error: any) {
      handleServiceError(error, 'fetch user');
    }
  }

  async getUsersLookupList(loggedInUserID: number) {
    try {
      return userRepository.getUsersLookupList(loggedInUserID);
    } catch (error: any) {
      handleServiceError(error, 'fetch user lookup list');
    }
  }

  async getUserById(userID: number) {
    try {
      if (!userID) {
        throw CustomError.validationError('User ID is required');
      }
      const user = await userRepository.findById(userID);
      return user;
    } catch (error: any) {
      handleServiceError(error, 'fetch user');
    }
  }

  async updateUser(userID: number, userData: any, loggedInUserID: number) {
    try {
      // Business validation
      if (!userID) {
        throw CustomError.validationError('User ID is required');
      } else if (!userData) {
        throw CustomError.validationError('User data is required');
      }
      return userRepository.updateUser(userID, userData, loggedInUserID);
    } catch (error: any) {
      handleServiceError(error, 'update user');
    }
  }

  async deleteUser(userID: number, _loggedInUserID: number): Promise<void> {
    try {
      // Business validation
      if (!userID) {
        throw CustomError.validationError('User ID is required');
      }
      return await userRepository.deleteUser(userID);
    } catch (error: any) {
      handleServiceError(error, 'delete user');
    }
  }

  async changePassword(userID: any, currentPassword: string, newPassword: string): Promise<void> {
    try {
      if (!userID) {
        throw CustomError.validationError('User ID is required.');
      }
      return await userRepository.updatePassword(userID, currentPassword, newPassword);
    } catch (error: any) {
      handleServiceError(error, 'update password');
    }
  }

  async updateProfile(
    userID: number,
    profileData: { firstName: string; lastName: string; emailID: string },
  ) {
    try {
      const user = await userRepository.findById(userID);   
      // Check if email is being changed and if it's already in use
      if (profileData.emailID !== user.emailID) {
        const existingUser = await userRepository.findByEmail(profileData.emailID);
        if (existingUser) {
          throw CustomError.validationError('Email already in use.');
        }
      }

      return userRepository.updateUser(userID, profileData as any);
    } catch (error: any) {      
       handleServiceError(error, 'update user profile');
    }
  }
}
