export default function filterCarers(bookingState: object[], currentBooking: any, carers: object[]) {
    // Convert to proper types for TypeScript (though we're working with objects)
    const bookings = bookingState as Array<{
        selectedProviderId: number;
        [key: string]: any;
    }>;

    const carerList = carers as Array<{
        CarerID: number;
        IsAvailable: boolean;
        [key: string]: any;
    }>;

    // Get all provider IDs from current bookings
    const bookedProviderIds = bookings.map(booking => booking.selectedProviderId);
    const bookedDates = bookings.map(booking => booking.selectedDate);


    // Update carer availability
    const updatedCarers = carerList?.map(carer => {
        // If carer is booked in any of the bookings, mark as unavailable
        if (bookedProviderIds.includes(carer.CarerID) && bookedDates.includes(currentBooking.selectedDate) ) {

                return {
                    ...carer,
                    IsAvailable: false
                }
        }
        return carer;
    });

    return updatedCarers;
}