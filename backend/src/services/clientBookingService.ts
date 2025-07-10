import { ClientBookingRepository } from '../repositories/clientBooking.repository';
import { CustomError } from '../utils/CustomError';
import { handleServiceError } from '../utils/handleDBError';

const clientBookingRepository = new ClientBookingRepository();

export class ClientBookingService {
  async getClientServices(): Promise<any[]> {
    try {
      return await clientBookingRepository.getClientServices();
    } catch (error: any) {
      handleServiceError(error, 'fetch client services');
      throw error;
    }
  }

  async getAvailableBookingDates(serviceID: number, bookingID?: number): Promise<any[]> {
    try {
      return await clientBookingRepository.getAvailableBookingDates(serviceID, bookingID);
    } catch (error: any) {
      handleServiceError(error, 'fetch available booking dates');
      throw error;
    }
  }

  async getAvailableBookingTimeSlots(
    serviceID: number,
    serviceDurationID: number,
    bookingDate: string,
    bookingID?: number,
  ): Promise<any[]> {
    try {
      if (!serviceID || !serviceDurationID || !bookingDate) {
        throw CustomError.validationError('Missing required parameters');
      }
      return await clientBookingRepository.getAvailableBookingTimeSlots(
        serviceID,
        serviceDurationID,
        bookingDate,
        bookingID,
      );
    } catch (error: any) {
      handleServiceError(error, 'fetch available time slots');
      throw error;
    }
  }

  async getClientCarer(
    serviceID: number,
    duration: number,
    bookingDateTime: string,
    bookingID?: number,
  ): Promise<any[]> {
    try {
      if (!serviceID || !duration || !bookingDateTime) {
        throw CustomError.validationError('Missing required parameters');
      }
      return await clientBookingRepository.getClientCarer(
        serviceID,
        duration,
        bookingDateTime,
        bookingID,
      );
    } catch (error: any) {
      handleServiceError(error, 'fetch carer client');
      throw error;
    }
  }

  async insertBooking(
    operatingUserID: any,
    bookings: {
      bookingDateTime: string;
      clientID: number;
      serviceID: number;
      carerID: number;
      duration: number;
      descr: string;

      isRecurring: boolean;
      frequencyDuration: number;
      frequencyInterval: number;
      frequencyType: number;
    }[],
  ): Promise<any> {
    try {
      if (!operatingUserID || !bookings || bookings.length === 0) {
        throw CustomError.validationError('Invalid booking data');
      }
      // Validate each booking
      for (const booking of bookings) {
        if (
          !booking.bookingDateTime ||
          !booking.clientID ||
          !booking.serviceID ||
          !booking.carerID ||
          !booking.duration
        ) {
          throw CustomError.validationError('Missing required booking fields');
        }
      }

      return await clientBookingRepository.insertBooking(operatingUserID, bookings);
    } catch (error: any) {
      handleServiceError(error, 'create booking');
    }
  }

  async getBookingList(
    clientID?: any,
    bookingStatus?: number,
    dateFrom?: Date,
    dateTo?: Date,
    bookingType?: Boolean,
  ): Promise<any[]> {
    try {
      // Validate date range if both dates are provided
      if (dateFrom && dateTo && dateFrom > dateTo) {
        throw CustomError.validationError('Invalid date range');
      }

      return await clientBookingRepository.getBookingList(
        clientID,
        bookingStatus,
        dateFrom,
        dateTo,
        bookingType,
      );
    } catch (error: any) {
      handleServiceError(error, 'retrieve booking list');
      throw error;
    }
  }

  async deleteBooking(bookingID: number): Promise<void> {
    try {
      if (!bookingID) {
        throw CustomError.validationError('Booking ID is required');
      }
      await clientBookingRepository.deleteBooking(bookingID);
    } catch (error: any) {
      handleServiceError(error, 'delete booking');
    }
  }

  async updateBooking(
    operatingUserID: any,
    data: {
      selectedBookingID: number;
      bookingDateTime: string;
      serviceID: number;
      carerID: number;
      duration: number;
      descr: string;

      isRecurring: boolean;
      frequencyDuration: number;
      frequencyInterval: number;
      frequencyType: number;
    },
  ): Promise<number> {
    try {
      if (
        !operatingUserID ||
        !data.selectedBookingID ||
        !data.bookingDateTime ||
        !data.serviceID ||
        !data.carerID ||
        !data.duration
      ) {
        throw CustomError.validationError('Missing required booking fields');
      }
      return await clientBookingRepository.updateBooking(operatingUserID, data);
    } catch (error: any) {
      handleServiceError(error, 'update booking');
      throw error;
    }
  }

  async getBookingById(bookingID: number): Promise<any[]> {
    try {
      if (!bookingID) {
        throw CustomError.validationError('Booking ID is required');
      }
      return await clientBookingRepository.getBookingById(bookingID);
    } catch (error: any) {
      handleServiceError(error, 'retrieve booking details');
      throw error;
    }
  }
}
