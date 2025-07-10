import { AdminCalendarRepository } from '../repositories/adminCalendar.repository';
import { handleServiceError } from '../utils/handleDBError';

const adminCalendarRepository = new AdminCalendarRepository();

export class AdminCalendarService {
  async getAdminCalendar(
    carerID?: number | null,
    dateFrom?: string | null,
    dateTo?: string | null,
    bookingType?: number,
  ): Promise<any> {
    try {
      return await adminCalendarRepository.getAdminCalendar(carerID, dateFrom, dateTo, bookingType);
    } catch (error: any) {
      handleServiceError(error, 'fetch admin calendar data');
    }
  }

  async getClientLookupList(): Promise<any> {
    try {
      return await adminCalendarRepository.getClientLookupList();
    } catch (error: any) {
      handleServiceError(error, 'fetch client lookup list');
    }
  }

  async updateCompletionStatus(data: any, operatingUserID: any): Promise<any> {
    try {
      return await adminCalendarRepository.updateCompletionStatus(data, operatingUserID);
    } catch (error: any) {
      handleServiceError(error, 'update completion status');
    }
  }

  async getAdminRoster(data: any): Promise<any> {
    try {
      return await adminCalendarRepository.getAdminRoster(data);
    } catch (error: any) {
      handleServiceError(error, 'fetch admin roster');
    }
  }
}
