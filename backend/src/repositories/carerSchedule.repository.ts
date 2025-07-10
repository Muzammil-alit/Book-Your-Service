import { executeStoredProcedure, toSqlTime7 } from '../utils/ExecuteProcedureFn';
import sql from 'mssql';
import { handleRepositoryError } from '../utils/handleDBError';
import { eModuleName } from '../utils/dbConstraintMap';

export interface WeeklyScheduleItem {
  weekday: number;
  startTime: string;
  endTime: string;
}

export class CarerScheduleRepository {
  async getCarerWeeklySchedule(carerID: number): Promise<WeeklyScheduleItem[]> {
    try {
      const result = await executeStoredProcedure('GetCarerWeeklySchedule', { carerID });
      return result;
    } catch (error: any) {
     handleRepositoryError(error, eModuleName.carerSchedule);
     return []
    }
  }

  async updateCarerWeeklySchedule(
    carerID: number,
    scheduleData: WeeklyScheduleItem[],
  ): Promise<void> {
    const params = {
      CarerID: carerID,
    };

    const tvps = {
      Schedule: {
        typeName: 'CarerWeeklyScheduleTableType',
        columns: [
          { name: 'WeekDay', type: sql.Int },
          { name: 'StartTime', type: sql.Time(7) },
          { name: 'EndTime', type: sql.Time(7) },
        ],
        rows: scheduleData.map((item) => [
          item.weekday,
          toSqlTime7(item.startTime),
          toSqlTime7(item.endTime),
        ]),
      },
    };

    try {
      await executeStoredProcedure('UpdateCarerWeeklySchedule', params, tvps);
    } catch (error: any) {
      if (error.original?.message?.includes('StartTime must be earlier than EndTime')) {
        handleRepositoryError(
          error,
          eModuleName.carerSchedule,
          'Start time must be earlier than End time for all entries',
        );
      }
      handleRepositoryError(error, eModuleName.carerSchedule);
    }
  }

  async deleteCarerWeeklyScheduleDay(carerID: number, weekday: number): Promise<boolean> {
    try {
      const result = await executeStoredProcedure('DeleteCarerWeeklyScheduleDay', {
        carerID,
        weekday,
      });
      return result?.[0]?.deleted === true || result?.[0]?.deleted === 1;
    } catch (error: any) {
      handleRepositoryError(error, eModuleName.carerSchedule);
      throw error;
    }
  }
}
