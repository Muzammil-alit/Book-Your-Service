import { FetchWrapper } from "../fetchWrapper";

export class CarerOffDaysService {
  async getCarerOffDays(carerID: number) {
    return FetchWrapper.get(`admin/carerOffDays/${carerID}`);
  }

  async createCarerOffDay(carerID: number, dateFrom: string, dateTo: string) {
    return FetchWrapper.post(`admin/carerOffDays/create`, { carerID, dateFrom, dateTo });
  }

  async updateCarerOffDayById(carerID: number, carerOffDayID: number, dateFrom: string, dateTo: string) {
    return FetchWrapper.put(`admin/carerOffDays/updateById`, { carerID, carerOffDayID, dateFrom, dateTo });
  }

  async updateCalendarOffDays(carerID: number, offDays: any) {
    return FetchWrapper.put(`admin/carerOffDays/updateCalendar`, { carerID, offDays });
  }



  async deleteCarerOffDay(carerID: number, carerOffDayID: number) {
    return FetchWrapper.delete(`admin/carerOffDays/delete`, { carerID, carerOffDayID });
  }
} 