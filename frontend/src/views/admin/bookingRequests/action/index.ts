
import { toast } from "react-toastify";
import { ClientBookingService } from "@/api/services/ClientBookingServices";

const clientBookingService = new ClientBookingService();


export const getMyBookingsWithFiltersApiCall = async (filters: object) => {
  try {
    const response = await clientBookingService.getMyBookingsWithFilters(filters);
    if (!response.isOk) {
      const errorMessage = response.data.message as string;
      toast.error(errorMessage || "Unable to fetch activity logs");
    } 
    else {
      return response?.data?.data
    }
  } 
  
  catch (error: unknown) {
    if (error instanceof Error) {
      toast.error(error?.message || "Something went wrong");
    } else {
      toast.error("Something went wrong");
    }
  }
}



export const updateBookingStatusApiCall = async (BookingID: string | number, BookingStatus: number, carerID: number | string | null, userID: any, reason?: string | null, cancelAll?: boolean, cancelledByAdmin?: boolean | null) => {
  

  try {
      
    const response = await clientBookingService.updateBookingStatus(BookingID, BookingStatus, carerID, userID, reason, cancelAll, cancelledByAdmin);
    if (!response.isOk) {
      const errorMessage = response.data.message as string;
      toast.error(errorMessage || "Unable to update booking status");
    } 
    else {
      return response
    }
  } 
  
  catch (error: unknown) {
    if (error instanceof Error) {
      toast.error(error?.message || "Something went wrong");
    } else {
      toast.error("Something went wrong");
    }
  }
}



export const getBookingbyIDApiCall = async (bookingID: number) => {
  try {
    const response = await clientBookingService.getBookingbyID(bookingID);
    if (!response.isOk) {
      const errorMessage = response.data.message as string;
      toast.error(errorMessage || "Unable to fetch booking data");
    } 
    else {
      return response?.data?.data
    }
  } 
  
  catch (error: unknown) {
    if (error instanceof Error) {
      toast.error(error?.message || "Something went wrong");
    } else {
      toast.error("Something went wrong");
    }
  }
}