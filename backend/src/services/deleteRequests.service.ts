import { AccountDeleteRequestRepository } from '../repositories/deleteRequests.repository';
import { CustomError } from '../utils/CustomError';
import { handleServiceError } from '../utils/handleDBError';

const accountDeleteRequestRepository = new AccountDeleteRequestRepository();

export class AccountDeleteRequestService {
  async createRequest(clientID: number, reason: string, operatingUserID: number): Promise<number> {
    try {
      if (!clientID || !reason || !operatingUserID) {
        throw CustomError.validationError('Missing required parameters');
      }
      if (reason.length < 10) {
        throw CustomError.validationError('Reason must be at least 10 characters');
      }
      return await accountDeleteRequestRepository.createRequest(clientID, reason, operatingUserID);
    } catch (error: any) {
      handleServiceError(error, 'process delete request');
      throw error;
    }
  }

  async getRequests(deleteStatus?: number, dateFrom?: Date, dateTo?: Date): Promise<any[]> {
    try {
      // Validate date range if both dates are provided
      if (dateFrom && dateTo && dateFrom > dateTo) {
        throw CustomError.validationError('Invalid date range');
      }
      return await accountDeleteRequestRepository.getRequests(deleteStatus, dateFrom, dateTo);
    } catch (error: any) {
      handleServiceError(error, 'fetch delete request');
      throw error;
    }
  }

  async updateRequestStatus(
    accountDeleteRequestID: number,
    deleteStatus: number,
    operatingUserID: number,
  ): Promise<void> {
    try {
      if (!accountDeleteRequestID || !operatingUserID) {
        throw CustomError.validationError('Missing required parameters');
      }

      // Validate status (assuming 1=approved, 2=rejected, etc.)
      if (![1, 2, 3].includes(deleteStatus)) {
        throw CustomError.validationError('Invalid status value');
      }

      await accountDeleteRequestRepository.updateRequestStatus(
        accountDeleteRequestID,
        deleteStatus,
        operatingUserID,
      );
    } catch (error: any) {
      handleServiceError(error, 'update delete request');
      throw error;
    }
  }

  async getRequestByID(accountDeleteRequestID: number): Promise<any> {
    try {
      if (!accountDeleteRequestID) {
        throw CustomError.validationError('Request ID is required');
      }
      return await accountDeleteRequestRepository.getRequestByID(accountDeleteRequestID);
    } catch (error: any) {
      handleServiceError(error, 'fetch delete request');
      throw error;
    }
  }

  async getRequestByClientID(clientID: number): Promise<any> {
    try {
      if (!clientID) {
        throw CustomError.badRequest('Client ID is required');
      }
      return await accountDeleteRequestRepository.getRequestByClientID(clientID);
    } catch (error: any) {
      handleServiceError(error, 'fetch delete request');
    }
  }
}
