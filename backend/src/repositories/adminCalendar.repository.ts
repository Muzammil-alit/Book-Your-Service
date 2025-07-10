import { executeStoredProcedure, toNestedMultipleDataCalendar } from '../utils/ExecuteProcedureFn';
import sql from 'mssql';
import { handleRepositoryError } from '../utils/handleDBError';
import { eModuleName } from '../utils/dbConstraintMap';

export class AdminCalendarRepository {
  async getAdminCalendar(
    carerID?: number | null,
    dateFrom?: string | null,
    dateTo?: string | null,
    bookingType?: number,
  ): Promise<any> {
    const params = {
      carerID,
      dateFrom: dateFrom,
      dateTo: dateTo,
      bookingType: bookingType ?? null,
    };
    try {
      const result = await executeStoredProcedure('AdminCalendar', params, {}, {}, true);
      return toNestedMultipleDataCalendar(result);
    } catch (error: any) {
      handleRepositoryError(error, eModuleName.calendar);
    }
  }

  async getClientLookupList(): Promise<any> {
    try {
      const result = await executeStoredProcedure('GetClientLookupList', {});
      return result;
    } catch (error: any) {
      handleRepositoryError(error, eModuleName.calendar);
    }
  }

  async updateCompletionStatus(data: any, operatingUserID: number): Promise<any> {
    const params = {
      BookingID: data?.bookingID,
      CompletionStatus: data?.completionStatus,
      CarerNotes: data?.carerNotes,
      OperatingUserID: operatingUserID,
    };

    try {
      const result = await executeStoredProcedure(
        'CarerUpdateCompletionStatus',
        params,
        {},
        {
          ActualStartDateTime: {
            type: sql.DateTime,
            value: data.actualStartDateTime,
          },
          ActualEndDateTime: {
            type: sql.DateTime,
            value: data.actualEndDateTime,
          },
        },
      );
      return result;
    } catch (error: any) {
      handleRepositoryError(error, eModuleName.calendar);
    }
  }

  async getAdminRoster(data: any): Promise<any> {
    const params = {
      CarerID: data?.carerID,
      DateFrom: data?.dateFrom,
      DateTo: data?.dateTo,
    };
    try {
      const result = await executeStoredProcedure('AdminRoster', params);
      return result;
    } catch (error: any) {
      handleRepositoryError(error, eModuleName.calendar);
    }
  }
}
