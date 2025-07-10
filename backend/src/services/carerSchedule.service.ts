import {
  CarerScheduleRepository,
  WeeklyScheduleItem,
} from '../repositories/carerSchedule.repository';
import { CustomError } from '../utils/CustomError';
import { handleServiceError } from '../utils/handleDBError';

const carerScheduleRepository = new CarerScheduleRepository();

export class CarerScheduleService {
  async getCarerWeeklySchedule(carerID: number): Promise<WeeklyScheduleItem[]> {
    try {
      return await carerScheduleRepository.getCarerWeeklySchedule(carerID);
    } catch (error: any) {
      handleServiceError(error, 'fetch carer schedule');
      throw error;
    }
  }

  async updateCarerWeeklySchedule(
    carerID: number,
    scheduleData: WeeklyScheduleItem[],
  ): Promise<void> {
    try {
      await carerScheduleRepository.updateCarerWeeklySchedule(carerID, scheduleData);
    } catch (error: any) {
      handleServiceError(error, 'update carer weekly schedule');
    }
  }

  async deleteCarerWeeklyScheduleDay(carerID: number, weekday: number): Promise<boolean> {
    try {
      if (weekday < 0 || weekday > 6) {
        throw CustomError.validationError('Invalid weekday');
      }

      return await carerScheduleRepository.deleteCarerWeeklyScheduleDay(carerID, weekday);
    } catch (error: any) {
      handleServiceError(error, 'delete carer weekly schedule');
      throw error;
    }
  }
}
