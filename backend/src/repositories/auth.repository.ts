import { executeStoredProcedure } from '../utils/ExecuteProcedureFn';
import { handleRepositoryError } from '../utils/handleDBError';
import { eModuleName } from '../utils/dbConstraintMap';

export class AuthRepository {
  async loginUser(emailID: string, password: string, userType: number): Promise<any> {
    let params = {
      EmailID: emailID,
      Password: password,
      LoginType: userType,
    };

    try {
      const results = await executeStoredProcedure('UserLogin', params);
      return results;
    } catch (error: any) {
        handleRepositoryError(error, eModuleName.login);
    }
  }

  async registerClient(data: any): Promise<any> {
    const params = {
      FirstName: data?.firstName,
      LastName: data?.lastName,
      EmailID: data?.emailID,
      Password: data?.password,
      PhoneNo: data?.phoneNo,
      SubcribePromotionNotification: data?.subscribeNewsletter || false,
    };

    try {
      const results = await executeStoredProcedure('ClientRegistration', params);
      return results;
    } catch (error: any) {
       handleRepositoryError(error, eModuleName.login);
    }
  }

  async generateResetPasswordCode(
    emailID: string,
  ): Promise<{ success: boolean; message?: string; data?: any }> {
    const params = {
      EmailID: emailID,
    };

    try {
      const results = await executeStoredProcedure('UserGenerateResetPasswordCode', params);
      return {
        success: true,
        data: results[0],
      };
    } catch (error: any) {
      // Check for SQL Server error structure
      if (error.originalError?.info?.message) {
        return {
          success: false,
          message: error.originalError.info.message,
        };
      }
      // Fallback to general error message
      return {
        success: false,
        message: error.message || 'Failed to generate reset password code',
      };
    }
  }

  async validateResetPasswordCode(
    resetPasswordCode: string,
  ): Promise<{ isValid: boolean; message?: string }> {
    const params = {
      ResetPasswordCode: resetPasswordCode,
    };

    try {
      const results = await executeStoredProcedure('UserValidateResetPasswordCode', params);
      return results;
    } catch (error: any) {
      if (error.original?.message) {
        return {
          isValid: false,
          message: error.original.message,
        };
      }
      return {
        isValid: false,
        message: error.message || 'Failed to validate reset password code',
      };
    }
  }

  async resetPassword(
    resetPasswordCode: string,
    newPassword: string,
  ): Promise<{ success: boolean; message?: string }> {
    const params = {
      ResetPasswordCode: resetPasswordCode,
      NewPassword: newPassword,
    };

    try {
      const results = await executeStoredProcedure('UserResetPassword', params);
      return results;
    } catch (error: any) {
      if (error.original?.message) {
        return {
          success: false,
          message: error.original.message,
        };
      }
      return {
        success: false,
        message: error.message || 'Failed to reset password',
      };
    }
  }
}
