
import { toast } from "react-toastify";
import { AdminCalendarService } from "@/api/services/AdminCalendarServices.service";

const adminCalendarService = new AdminCalendarService();



export const getAdminCalendar = async (carerID: any, dateFrom: any, dateTo: any) => {
  try {
    const response = await adminCalendarService.getAdminCalendar(carerID, dateFrom, dateTo);
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


export const getClientListApiCall = async () => {
  try {
    const response = await adminCalendarService.getClientList();
    if (!response.isOk) {
      const errorMessage = response.data.message as string;
      toast.error(errorMessage || "Unable to fetch client logs");
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


export const updateCompletionStatus = async (data: any) => {
  try {
    const response = await adminCalendarService.updateCompletionStatus(data);
    if (!response.isOk) {
      const errorMessage = response.data.message as string;
      toast.error(errorMessage || "Unable to fetch activity logs");
    } 
    else {
      toast.success('Booking status updated successfully');
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
