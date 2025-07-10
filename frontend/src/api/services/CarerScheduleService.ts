import { FetchWrapper } from "../fetchWrapper";

export type CarerWeeklyScheduleItem = {
  WeekDay: number;
  startTime: string;
  endTime: string;
};

export class CarerScheduleService {
  /**
   * Get the carer's weekly schedule
   */
  async getCarerWeeklySchedule(carerID: number) {
    return FetchWrapper.get(`admin/carer-schedule/${carerID}`);
  }

  /**
   * Create or update the carer's weekly schedule
   */
  async updateCarerWeeklySchedule(carerID: number, scheduleData: CarerWeeklyScheduleItem[]) {
    return FetchWrapper.post(`admin/carer-schedule/${carerID}`, { scheduleData });
  }

  /**
   * Delete a specific weekday from the carer's weekly schedule
   */
  async deleteCarerWeeklyScheduleDay(carerID: number, weekday: number) {
    return FetchWrapper.delete(`admin/carers/${carerID}/weekly-schedule/${weekday}`);
  }
}

export default new CarerScheduleService(); 