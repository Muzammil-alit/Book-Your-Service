import { Dayjs } from "dayjs";
import { FetchWrapper } from "../fetchWrapper";

export class ClientBookingService {
  async getClientServices() {
    return FetchWrapper.get(`client/booking/services`);
  }

  async getAvailableDates(serviceID: number | null, bookingID: any) {
    return FetchWrapper.post(`client/booking/dates`, { serviceID, bookingID });
  }


  async getTimeslots(serviceID: number | null, serviceDurationID: number, bookingDate: Dayjs | string | null, bookingID: any) {
    return FetchWrapper.post(`client/booking/timeslots`, { serviceID, serviceDurationID, bookingDate, bookingID });
  }

  async getClientCarer(serviceID: number | null, duration: number, bookingDateTime: string, bookingID: any) {
    return FetchWrapper.post(`client/booking/carer`, { serviceID, duration, bookingDateTime, bookingID });
  }


  async confirmBooking(bookingData: object) {
    return FetchWrapper.post(`client/booking/confirm`, { bookingData });
  }





  async getMyBookings(clientID: number | null) {
    return FetchWrapper.get(`client/booking/mybookings/${clientID}`);
  }


  async deleteBooking(bookingID: number) {
      
    return FetchWrapper.delete(`client/booking/deletebooking/${bookingID}`);
  }


  async updateBooking(bookingID: number, bookingData: Record<string, unknown>) {
    return FetchWrapper.put(`client/booking/updatebooking/${bookingID}`, bookingData);
  }

  async getBookingbyID(bookingID: number) {
    return FetchWrapper.get(`client/mybookings/getbooking/${bookingID}`);
  }










  async getMyBookingsWithFilters(filters: any) {
    return FetchWrapper.post(`client/mybookings/allbookings`, filters);
  }

  async updateBookingStatus(BookingID: string | number, BookingStatus: number, CarerID: number | string | null, userID: any, reason?: string | null, cancelAll?: boolean, cancelledByAdmin?: boolean | null) {
    return FetchWrapper.post(`admin/bookings/update-booking-status/${BookingID}`, { BookingStatus, CarerID, userID, reason, cancelAll, cancelledByAdmin });
  }



} 