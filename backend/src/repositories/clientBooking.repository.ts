import { executeStoredProcedure, toNestedMultipleDataServices } from '../utils/ExecuteProcedureFn';
import sql from 'mssql';
import { handleRepositoryError } from '../utils/handleDBError';
import { eModuleName } from '../utils/dbConstraintMap';

interface BookingData {
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
}

interface UpdateBookingData {
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
}

export class ClientBookingRepository {
  async getClientServices(): Promise<any[]> {
    try {
      const result = await executeStoredProcedure('ClientServiceSelectionList', {}, {}, {}, true);
      return toNestedMultipleDataServices(result);
    } catch (error: any) {
      handleRepositoryError(error, eModuleName.booking);
      return [];
    }
  }

  async getAvailableBookingDates(
    serviceID: number,
    bookingID?: number,
  ): Promise<{ Date: string; IsCarerAvailable: boolean }[]> {
    try {
      const result = await executeStoredProcedure('ClientAvailableBookingDates', {
        ServiceID: serviceID,
        BookingID: bookingID ?? null,
      });
      return result;
    } catch (error: any) {
      handleRepositoryError(error, eModuleName.booking);
      return [];
    }
  }

  async getAvailableBookingTimeSlots(
    serviceID: number,
    serviceDurationID: number,
    bookingDate: any,
    bookingID?: number,
  ): Promise<any[]> {
    try {
      const result = await executeStoredProcedure('ClientAvailableBookingTimeSlotsList', {
        serviceID,
        serviceDurationID,
        bookingDate,
        bookingID: bookingID ?? null,
      });

      return result;
    } catch (error: any) {
      handleRepositoryError(error, eModuleName.booking);
      return [];
    }
  }

  async getClientCarer(
    serviceID: number,
    duration: number,
    bookingDateTime: any,
    bookingID?: number,
  ): Promise<any[]> {
    try {
      const result = await executeStoredProcedure('ClientCarerSelectionList', {
        serviceID,
        duration,
        bookingDateTime,
        bookingID: bookingID ?? null,
      });
      return result;
    } catch (error: any) {
      handleRepositoryError(error, eModuleName.booking);
      return [];
    }
  }

  async insertBooking(operatingUserID: number, bookings: BookingData[]): Promise<any> {
    // Define parameters
    const params = {
      OperatingUserID: operatingUserID,
    };

    // Define TVP structure for bookings
    const tvps = {
      Bookings: {
        typeName: 'BookingTableType', // Make sure this matches your SQL type
        columns: [
          { name: 'BookingDateTime', type: sql.DateTime },
          { name: 'ClientID', type: sql.Int },
          { name: 'ServiceID', type: sql.Int },
          { name: 'CarerID', type: sql.Int },
          { name: 'Duration', type: sql.Int },
          { name: 'Descr', type: sql.NVarChar(sql.MAX) },

          { name: 'IsRecurringBooking', type: sql.Bit },
          { name: 'FrequencyInterval', type: sql.Int },
          { name: 'FrequencyDuration', type: sql.Int },
          { name: 'FrequencyType', type: sql.Int },
        ],
        rows: bookings.map((b) => [
          b.bookingDateTime,
          b.clientID,
          b.serviceID,
          b.carerID,
          b.duration,
          b.descr,

          b.isRecurring,
          b.frequencyInterval,
          b.frequencyDuration,
          b.frequencyType,
        ]),
      },
    };

    try {
      const result = await executeStoredProcedure('BookingInsert', params, tvps);

      return result;
    } catch (error: any) {
      handleRepositoryError(error, eModuleName.booking);
    }
  }

  async getBookingList(
    clientID?: number,
    bookingStatus?: number,
    dateFrom?: Date,
    dateTo?: Date,
    bookingType?: Boolean,
  ): Promise<any[]> {
    try {
      const result = await executeStoredProcedure('GetBookingList', {
        clientID: clientID ?? null,
        bookingStatus: bookingStatus ?? null,
        dateFrom: dateFrom ?? null,
        dateTo: dateTo ?? null,
        bookingType: bookingType ?? null,
      });
      return result;
    } catch (error: any) {
      handleRepositoryError(error, eModuleName.booking);
      return [];
    }
  }

  async deleteBooking(bookingID: number): Promise<void> {
    try {
      await executeStoredProcedure('BookingDelete', { bookingID });
    } catch (error: any) {
      handleRepositoryError(error, eModuleName.booking);
    }
  }

  async updateBooking(operatingUserID: number, data: UpdateBookingData): Promise<number> {
    try {
      const result = await executeStoredProcedure(
        'BookingUpdate',
        {
          bookingID: data.selectedBookingID,
          serviceID: data.serviceID,
          carerID: data.carerID,
          duration: data.duration,
          descr: data.descr,
          operatingUserID,

          isRecurringBooking: data.isRecurring,
          frequencyDuration: data.frequencyDuration,
          frequencyInterval: data.frequencyInterval,
          frequencyType: data.frequencyType,
        },
        {}, // Empty TVPs object
        {
          BookingDateTime: {
            type: sql.DateTime,
            value: data.bookingDateTime,
          },
        },
      );
      return result?.[0]?.BookingID;
    } catch (error: any) {
      handleRepositoryError(error, eModuleName.booking);
      throw error;
    }
  }

  async getBookingById(bookingID: number): Promise<any[]> {
    try {
      const result = await executeStoredProcedure('GetBookingByID', {
        bookingID,
      });
      return result;
    } catch (error: any) {
      handleRepositoryError(error, eModuleName.booking);
      return [];
    }
  }
}
