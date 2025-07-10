import { eModuleName } from "../utils/dbConstraintMap";
import { executeStoredProcedure } from "../utils/ExecuteProcedureFn";
import { handleRepositoryError } from "../utils/handleDBError";

export class AdminBookingRepository {
    async updateBookingStatus(
        bookingID: number,
        data: {
            BookingStatus: number;
            CarerID?: number | null;
            userID?: number | null;
            reason?: string
            cancelAll?: boolean
            cancelledByAdmin?: boolean | null;
        }
    ): Promise<any> {
        try {
            const result = await executeStoredProcedure("UpdateBookingStatus", {
                OperatingUserID: data.userID,
                bookingID: bookingID,
                bookingStatus: data.BookingStatus,
                carerID: data.CarerID ?? null,
                CancellationReason: data.reason ?? null,
                CancelAllRecurringBookings: data.cancelAll ?? null,
                CancelledByAdmin: data.cancelledByAdmin ?? null
            });

            return result;
        } catch (error: any) {          
            handleRepositoryError(error, eModuleName.booking);
        }
    }
}
