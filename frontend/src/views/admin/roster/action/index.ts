
import { toast } from "react-toastify";

import { AdminCalendarService } from "@/api/services/AdminCalendarServices.service";

const adminCalendarService = new AdminCalendarService();


export const getAdminRosterApiCall = async (filters: object) => {
  try {
    const response = await adminCalendarService.getAdminRoster(filters);
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

