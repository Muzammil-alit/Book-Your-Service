import { CustomError } from '../utils/CustomError';
import { eModuleName } from '../utils/dbConstraintMap';
import { executeStoredProcedure } from '../utils/ExecuteProcedureFn';
import { handleRepositoryError } from '../utils/handleDBError';

export class AccountDeleteRequestRepository {
  async createRequest(clientID: number, reason: string, operatingUserID: number): Promise<number> {
    try {
      const result = await executeStoredProcedure('ClientDeleteAccountRequest', {
        clientID,
        reason,
        operatingUserID,
      });

      return result?.[0]?.AccountDeleteRequestID;
    } catch (error: any) {
      handleRepositoryError(error, eModuleName.accountDeleteRequest);
      throw error;
    }
  }

  async getRequests(deleteStatus?: number, dateFrom?: Date, dateTo?: Date): Promise<any[]> {
    try {
      const result = await executeStoredProcedure('GetAccountDeleteRequestList', {
        deleteStatus: deleteStatus ?? null,
        dateFrom: dateFrom ?? null,
        dateTo: dateTo ?? null,
      });

      return result;
    } catch (error: any) {
      handleRepositoryError(error, eModuleName.accountDeleteRequest);
      throw error;
    }
  }

  async updateRequestStatus(
    accountDeleteRequestID: number,
    deleteStatus: number,
    operatingUserID: number,
  ): Promise<void> {
    try {
      await executeStoredProcedure('UpdateAccountDeleteRequestStatus', {
        accountDeleteRequestID,
        deleteStatus,
        operatingUserID,
      });
    } catch (error: any) {
      handleRepositoryError(error, eModuleName.accountDeleteRequest);
    }
  }

  async getRequestByID(accountDeleteRequestID: number): Promise<any> {
    try {
      const result = await executeStoredProcedure('GetAccountDeleteRequestByID', {
        accountDeleteRequestID,
      });

      if (!result || result.length === 0) {
        throw CustomError.badRequest('Delete request not found');
      }

      return result[0];
    } catch (error: any) {
      handleRepositoryError(error, eModuleName.accountDeleteRequest);
    }
  }

  async getRequestByClientID(clientID: number): Promise<any> {
    try {
      const result = await executeStoredProcedure('GetLatestAccountDeleteRequestByClientID', {
        clientID,
      });

      return result?.[0] || null;
    } catch (error: any) {
      handleRepositoryError(error, eModuleName.accountDeleteRequest);
    }
  }
}
