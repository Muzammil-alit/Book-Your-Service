import jwt from 'jsonwebtoken';
import { AuthRepository } from '../repositories/auth.repository';
import jwtConfig from '../config/jwtConfig';
import { CustomError } from '../utils/CustomError';
import { handleServiceError } from '../utils/handleDBError';

const authRepository = new AuthRepository();

export class AuthService {
  async loginUser(emailID: string, password: string, userType: number) {
    try {
      const userResult = await authRepository.loginUser(emailID, password, userType);
      const userInfo = userResult[0];

      const token = jwt.sign({ userID: userInfo.UserID }, jwtConfig.jwtSecret, {
        expiresIn: Number(jwtConfig.jwtExpiration) || '1d',
      });

      return { token, user: userInfo };
    } catch (error: any) {
      handleServiceError(error, 'login');
    }
  }

  async registerClient(data: any) {
    try {
      const result = await authRepository.registerClient(data);
      return result;
    } catch (error: any) {
      handleServiceError(error, 'register');
    }
  }

  async generateResetPasswordCode(data: any) {
    try {
      const result = await authRepository.generateResetPasswordCode(data);

      return result;
    } catch (error: any) {
      handleServiceError(error, 'generate reset password code');
    }
  }

  async validateResetPasswordCode(resetPasswordCode: string) {
    try {
      const result = await authRepository.validateResetPasswordCode(resetPasswordCode);

      if (!result.isValid) {
        throw CustomError.validationError(result.message || 'Invalid reset code');
      }
      return result;
    } catch (error: any) {
      handleServiceError(error, 'validate reset password code');
    }
  }

  async resetPassword(resetPasswordCode: string, newPassword: string) {
    try {
      // First validate the code
      await this.validateResetPasswordCode(resetPasswordCode);

      // Then reset the password
      const result = await authRepository.resetPassword(resetPasswordCode, newPassword);

      if (!result.success) {
        throw CustomError.validationError(result.message || 'Password reset failed');
      }

      return result;
    } catch (error: any) {
      handleServiceError(error, 'reset password');
    }
  }
}
