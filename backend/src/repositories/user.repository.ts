import { executeStoredProcedure } from '../utils/ExecuteProcedureFn';
import { handleRepositoryError } from '../utils/handleDBError';
import { eModuleName } from '../utils/dbConstraintMap';

export class UserRepository {
  async findByEmail(emailID: string) {
    try {
      const result = await executeStoredProcedure('FindUserByEmail', { emailID });
      return result[0] || null;
    } catch (error: any) {
      handleRepositoryError(error, eModuleName.user);
    }
  }

  async createUser(data: any) {
    try {
      const params = {
        firstName: data.firstName,
        lastName: data.lastName,
        emailID: data.emailID,
        password: data.password,
        userType: data.userType,
        operatingUserID: data.createdBy,
      };

      const result = await executeStoredProcedure('UserInsert', params);
      return result[0] || null;
    } catch (error: any) {
      handleRepositoryError(error, eModuleName.user);
    }
  }

  async getUserList() {
    try {
      const result = await executeStoredProcedure('GetUserList', {});
      return result;
    } catch (error: any) {
      handleRepositoryError(error, eModuleName.user);
    }
  }

  async getUsersLookupList(createdBy: number) {
    try {
      const result = await executeStoredProcedure('GetUsersLookupList', { createdBy });
      return result;
    } catch (error: any) {
      handleRepositoryError(error, eModuleName.user);
    }
  }

  async findById(userID: number) {
    try {
      const result = await executeStoredProcedure('GetUserByID', { userID });
      return result[0] || null;
    } catch (error: any) {
      handleRepositoryError(error, eModuleName.user);
    }
  }

  async updatePassword(
    userID: number,
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    try {
      await executeStoredProcedure('UserUpdatePassword', {
        UserID: userID,
        CurrentPassword: currentPassword,
        NewPassword: newPassword,
      });
    } catch (error: any) {
      handleRepositoryError(error, eModuleName.user);
    }
  }

  async updateUser(userID: number, updatedData: any, loggedInUserID?: number) {
    try {
      const params = {
        userID,
        operatingUserID: loggedInUserID ?? null,
        ...updatedData,
      };
      const result = await executeStoredProcedure('UserUpdate', params);
      return result;
    } catch (error: any) {
      handleRepositoryError(error, eModuleName.user);
    }
  }

  async deleteUser(userID: number) {
    try {
      await executeStoredProcedure('UserDelete', { userID });
    } catch (error: any) {
      handleRepositoryError(error, eModuleName.user);
    }
  }
}
