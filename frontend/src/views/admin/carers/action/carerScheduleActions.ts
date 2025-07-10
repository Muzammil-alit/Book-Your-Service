import { toast } from "react-toastify";
import CarerScheduleService, { CarerWeeklyScheduleItem } from "@/api/services/CarerScheduleService";

/**
 * Fetch a carer's weekly schedule
 */
export const fetchCarerWeeklySchedule = async (carerID: number): Promise<CarerWeeklyScheduleItem[]> => {
  try {
    const response = await CarerScheduleService.getCarerWeeklySchedule(carerID);
    
    if (!response.isOk) {
      const errorMessage = response.data.message as string;
      toast.error(errorMessage || "Failed to fetch carer's weekly schedule");
      return [];
    }
    else {
      return response.data.data.schedule

    }
    
  } catch (error) {
    if (error instanceof Error) {
      toast.error(error?.message || "Something went wrong");
    } else {
      toast.error("Failed to fetch carer's weekly schedule");
    }
    return [];
  }
};

/**
 * Save a carer's weekly schedule
 */
export const saveCarerWeeklySchedule = async (carerID: number, scheduleData: CarerWeeklyScheduleItem[]): Promise<boolean> => {
  try {
    const response = await CarerScheduleService.updateCarerWeeklySchedule(carerID, scheduleData);
    
    if (!response.isOk) {
      const errorMessage = response.data.message as string;
      toast.error(errorMessage || "Failed to save carer's weekly schedule");
      return false;
    }
    
    toast.success("Weekly schedule saved successfully");
    return true;
  } catch (error) {
    if (error instanceof Error) {
      toast.error(error?.message || "Something went wrong");
    } else {
      toast.error("Failed to save carer's weekly schedule");
    }
    return false;
  }
};

/**
 * Delete a specific day from a carer's weekly schedule
 */
export const deleteCarerWeeklyScheduleDay = async (carerID: number, weekday: number): Promise<boolean> => {
  try {
    const response = await CarerScheduleService.deleteCarerWeeklyScheduleDay(carerID, weekday);
    
    if (!response.isOk) {
      const errorMessage = response.data.message as string;
      toast.error(errorMessage || "Failed to delete schedule day");
      return false;
    }
    
    toast.success("Schedule day deleted successfully");
    return true;
  } catch (error) {
    if (error instanceof Error) {
      toast.error(error?.message || "Something went wrong");
    } else {
      toast.error("Failed to delete schedule day");
    }
    return false;
  }
}; 