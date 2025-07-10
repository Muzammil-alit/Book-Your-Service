import { eModuleName } from '../utils/dbConstraintMap';
import { executeStoredProcedure } from '../utils/ExecuteProcedureFn';
import { handleRepositoryError } from '../utils/handleDBError';

export class AdminDashboardRepository {
  async getDashboardHeader(): Promise<any> {
    try {
      const result = await executeStoredProcedure('GetDashboardHeader', {});
      return result[0];
    } catch (error: any) {
      handleRepositoryError(error, eModuleName.dashboard);
    }
  }

  async getActiveCarers(): Promise<any> {
    try {
      const result = await executeStoredProcedure('GetDashboardActiveCarers', {});
      return result;
    } catch (error: any) {
      handleRepositoryError(error, eModuleName.dashboard);
    }
  }

  async getInactiveCarers(): Promise<any> {
    try {
      const result = await executeStoredProcedure('GetDashboardInactiveCarers', {});
      return result;
    } catch (error: any) {
      handleRepositoryError(error, eModuleName.dashboard);
    }
  }

  async getMonthlyBookings(dateFrom: string, dateTo: string): Promise<any> {
    try {
      const result = await executeStoredProcedure('GetDashboardMonthlyBookings', {
        DateFrom: dateFrom,
        DateTo: dateTo,
      });
      return result;
    } catch (error: any) {
      handleRepositoryError(error, eModuleName.dashboard);
    }
  }

  async getMonthlyBookingsPerService(dateFrom: string, dateTo: string): Promise<any> {
    try {
      const result = await executeStoredProcedure('GetDashboardMonthlyBookingsPerService', {
        DateFrom: dateFrom,
        DateTo: dateTo,
      });
      return result;
    } catch (error: any) {
      handleRepositoryError(error, eModuleName.dashboard);
    }
  }

  async getMonthlyBookingsPerCarer(dateFrom: string, dateTo: string): Promise<any> {
    try {
      const result = await executeStoredProcedure('GetDashboardMonthlyBookingsPerCarer', {
        DateFrom: dateFrom,
        DateTo: dateTo,
      });
      return result;
    } catch (error: any) {
      handleRepositoryError(error, eModuleName.dashboard);
    }
  }

  async getDashboardNotifications(): Promise<any> {
    try {
      const result = await executeStoredProcedure('getDashboardNotifications', {}, {}, {}, true);
      return result;
    } catch (error: any) {
      handleRepositoryError(error, eModuleName.dashboard);
    }
  }
}
