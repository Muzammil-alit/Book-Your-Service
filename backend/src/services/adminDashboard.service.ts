import { AdminDashboardRepository } from '../repositories/adminDashboard.repository';
import { handleServiceError } from '../utils/handleDBError';

const adminDashboardRepository = new AdminDashboardRepository();

export class AdminDashboardService {
  async getDashboardHeader(): Promise<any> {
    try {
      return await adminDashboardRepository.getDashboardHeader();
    } catch (error: any) {
      handleServiceError(error, 'fetch dashboard');
    }
  }

  async getActiveCarers(): Promise<any> {
    try {
      return await adminDashboardRepository.getActiveCarers();
    } catch (error: any) {
      handleServiceError(error, 'fetch active carers');
    }
  }

  async getInactiveCarers(): Promise<any> {
    try {
      return await adminDashboardRepository.getInactiveCarers();
    } catch (error: any) {
      handleServiceError(error, 'fetch inactive carers');
    }
  }

  async getMonthlyBookings(dateFrom: string, dateTo: string): Promise<any> {
    try {
      return await adminDashboardRepository.getMonthlyBookings(dateFrom, dateTo);
    } catch (error: any) {
      handleServiceError(error, 'fetch monthly bookings');
    }
  }

  async getMonthlyBookingsPerService(dateFrom: string, dateTo: string): Promise<any> {
    try {
      return await adminDashboardRepository.getMonthlyBookingsPerService(dateFrom, dateTo);
    } catch (error: any) {
      handleServiceError(error, 'fetch monthly bookings per service');
    }
  }

  async getMonthlyBookingsPerCarer(dateFrom: string, dateTo: string): Promise<any> {
    try {
      return await adminDashboardRepository.getMonthlyBookingsPerCarer(dateFrom, dateTo);
    } catch (error: any) {
      handleServiceError(error, 'fetch monthly bookings per carer');
    }
  }

  async getDashboardNotifications(): Promise<any> {
    try {
      return await adminDashboardRepository.getDashboardNotifications();
    } catch (error: any) {
      handleServiceError(error, 'fetch dashboard notifications');
    }
  }
}
