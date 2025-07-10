import { AdminBookingRepository } from "../repositories/adminBooking.repository";
import { handleServiceError } from "../utils/handleDBError";

const adminBookingRepository = new AdminBookingRepository();

export class AdminBookingService {
    async updateBookingStatus(
        bookingID: number,
        data: {
            BookingStatus: number;
            CarerID?: number | null;
            userID?: number | null;
            cancelAll?: boolean;
            cancelledByAdmin?: boolean | null;
        }
    ): Promise<any> {
        try {
            return await adminBookingRepository.updateBookingStatus(bookingID, data);
        } catch (error: any) {
             handleServiceError(error, 'update booking status');
        }
    }
}