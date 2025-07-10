import { AppDispatch } from "@/redux/store";
import { CarerService } from "@/api/services/CarerService";
import { CarerOffDaysService } from "@/api/services/CarerOffDaysService";
import { toast } from "react-toastify";
import { CarerType } from "@/types/apps/carerTypes";

const carerService = new CarerService();
const carerOffDaysService = new CarerOffDaysService();

// Get carer lookup list for dropdown
export const getCarerLookupListApiCall = async (dispatch: AppDispatch): Promise<CarerType[]> => {
  try {
    const response = await carerService.getCarerLookupList();
    if (!response.isOk) {
      const errorMessage = response.data.message as string;
      toast.error(errorMessage || "Unable to fetch carers");
      return [];
    } else {
      return (response.data.data as { carers: CarerType[] }).carers || [];
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      toast.error(error?.message || "Something went wrong");
    } else {
      toast.error("Something went wrong");
    }
    return [];
  }
};

// Get carer off days
export interface CarerOffDayRecord {
  carerOffDayID: number;
  carerID: number;
  DateFrom: string;
  DateTo: string;
  CreatedOn: string;
  CreatedByUserName: number | null;
  UpdatedOn: string;
  UpdatedByUserName: number | null;
  createdByName?: string;
  updatedByName?: string;
  offDays?: any
  CarerOffDayID?: any
}

export const getCarerOffDaysApiCall = async (carerID: number): Promise<CarerOffDayRecord[]> => {
  try {
    const response = await carerOffDaysService.getCarerOffDays(carerID);
    if (!response.isOk) {
      const errorMessage = response.data.message as string;
      toast.error(errorMessage || "Unable to fetch carer off days");
      return [];
    } else {
      return Array.isArray(response.data.data) ? response.data.data : [];
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      toast.error(error?.message || "Something went wrong");
    } else {
      toast.error("Something went wrong");
    }
    return [];
  }
};

// Update carer off days
export const updateCalendarOffDaysApiCall = async (carerID: number, offDays: string[]): Promise<boolean> => {
  try {
    
    const response = await carerOffDaysService.updateCalendarOffDays(carerID, offDays);
    if (!response.isOk) {
      const errorMessage = response.data.message as string;
      toast.error(errorMessage || "Unable to update carer off days");
      return false;
    } else {
      toast.success("Carer off days updated successfully");
      return true;
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      toast.error(error?.message || "Something went wrong");
    } else {
      toast.error("Something went wrong");
    }
    return false;
  }
};

// Update carer off day by ID
export const updateCarerOffDayByIdApiCall = async (
  carerID: number, 
  carerOffDayID: number, 
  dateFrom: string, 
  dateTo: string
): Promise<boolean> => {
  try {
    const response = await carerOffDaysService.updateCarerOffDayById(carerID, carerOffDayID, dateFrom, dateTo);
    if (!response.isOk) {
      const errorMessage = response.data.message as string;
      toast.error(errorMessage || "Unable to update carer off day");
      return false;
    } else {
      toast.success("Carer off day updated successfully");
      return true;
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      toast.error(error?.message || "Something went wrong");
    } else {
      toast.error("Something went wrong");
    }
    return false;
  }
};

// Delete specific carer off day
export const deleteCarerOffDayApiCall = async (carerID: number, carerOffDayID: number): Promise<boolean> => {
  try {
    const response = await carerOffDaysService.deleteCarerOffDay(carerID, carerOffDayID);
    if (!response.isOk) {
      const errorMessage = response.data.message as string;
      toast.error(errorMessage || "Unable to delete carer off day");
      return false;
    } else {
      toast.success("Carer off day deleted successfully");
      return true;
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      toast.error(error?.message || "Something went wrong");
    } else {
      toast.error("Something went wrong");
    }
    return false;
  }
};

// Create carer off day with date range
export const createCarerOffDayApiCall = async (
  carerID: number,
  dateFrom: string,
  dateTo: string
): Promise<boolean> => {
  try {
    const response = await carerOffDaysService.createCarerOffDay(carerID, dateFrom, dateTo);
      
    if (!response.isOk) {
      const errorMessage = response.data.message as string;
      toast.error(errorMessage || "Unable to create carer off day");
      return false;
    } else {
      toast.success("Carer off day created successfully");
      return true;
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      toast.error(error?.message || "Something went wrong");
    } else {
      toast.error("Something went wrong");
    }
    return false;
  }
}; 