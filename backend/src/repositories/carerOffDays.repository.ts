import { executeStoredProcedure } from '../utils/ExecuteProcedureFn';
import sql from 'mssql';
import { handleRepositoryError } from '../utils/handleDBError';
import { eModuleName } from '../utils/dbConstraintMap';

export class CarerOffDayRepository {
  async create(
    carerID: number,
    dateFrom: Date,
    dateTo: Date,
    operatingUserID: number,
  ): Promise<void> {
    const params = {
      CarerID: carerID,
      DateFrom: dateFrom,
      DateTo: dateTo,
      OperatingUserID: operatingUserID,
    };

    try {
      const result = await executeStoredProcedure('CarerOffDayInsert', params);
      return result;
    } catch (error: any) {
      handleRepositoryError(error, eModuleName.carerOffDays);
    }
  }

  async update(
    carerOffDayID: number,
    dateFrom: Date,
    dateTo: Date,
    operatingUserID: number,
  ): Promise<void> {
    const params = {
      CarerOffDayID: carerOffDayID,
      DateFrom: dateFrom,
      DateTo: dateTo,
      OperatingUserID: operatingUserID,
    };

    try {
      await executeStoredProcedure('CarerOffDayUpdate', params);
    } catch (error: any) {
      handleRepositoryError(error, eModuleName.carerOffDays);
    }
  }

  async updateCarerOffDays(carerID: number, offDays: any, operatingUserID: number): Promise<void> {
    const params = {
      CarerID: carerID,
      OperatingUserID: operatingUserID,
    };
    const OffDaysTable = new sql.Table();
    OffDaysTable.columns.add('Date', sql.Date);

    offDays.forEach((date) => {
      OffDaysTable.rows.add(date);
    });

    try {
      await executeStoredProcedure('UpdateCarerOffDays', { ...params, OffDays: OffDaysTable });
    } catch (error: any) {
      handleRepositoryError(error, eModuleName.carerOffDays);
    }
  }

  async delete(carerOffDayID: number): Promise<void> {
    const params = { CarerOffDayID: carerOffDayID };

    try {
      const result = await executeStoredProcedure('CarerOffDayDelete', params);
      return result;
    } catch (error: any) {
      handleRepositoryError(error, eModuleName.carerOffDays);
    }
  }

  async getCarerOffDayByID(carerOffDayID: number): Promise<any> {
    const params = { CarerOffDayID: carerOffDayID };
    try {
      const result = await executeStoredProcedure('GetCarerOffDayByID', params);
      return result;
    } catch (error: any) {
      handleRepositoryError(error, eModuleName.carerOffDays);
    }
  }

  async getListByCarerID(carerID: number): Promise<any[]> {
    const params = { CarerID: carerID };
    try {
      const result = await executeStoredProcedure('GetCarerOffDayList', params);
      return result || [];
    } catch (error: any) {
      handleRepositoryError(error, eModuleName.carerOffDays);
      return [];
    }
  }
}
