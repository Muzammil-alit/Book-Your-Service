import { AppDispatch } from "@/redux/store";
import { toast } from "react-toastify";
import { AdminDashboardService } from "@/api/services/AdminDashboardServices.service";

const adminDashboardService = new AdminDashboardService();

export const getDashboardHeaderApiCall = async () => {
  try {
    const response = await adminDashboardService.getDashboardHeader();
    if (!response.isOk) {
      const errorMessage = response.data.message as string;
      toast.error(errorMessage || "Unable to fetch dashboard header");
    } 
    else {
      return response?.data?.data;
    }
  } 
  catch (error: unknown) {
    if (error instanceof Error) {
      toast.error(error?.message || "Failed to load dashboard header");
    } else {
      toast.error("Failed to load dashboard header");
    }
  }
}

export const getDashboardActiveCarersApiCall = async () => {
  try {
    const response = await adminDashboardService.getDashboardActiveCarers();
    if (!response.isOk) {
      const errorMessage = response.data.message as string;
      toast.error(errorMessage || "Unable to fetch active carers");
    } 
    else {
      return response?.data?.data;
    }
  } 
  catch (error: unknown) {
    if (error instanceof Error) {
      toast.error(error?.message || "Failed to load active carers");
    } else {
      toast.error("Failed to load active carers");
    }
  }
}

export const getDashboardInactiveCarersApiCall = async () => {
  try {
    const response = await adminDashboardService.getDashboardInactiveCarers();
    if (!response.isOk) {
      const errorMessage = response.data.message as string;
      toast.error(errorMessage || "Unable to fetch inactive carers");
    } 
    else {
      return response?.data?.data;
    }
  } 
  catch (error: unknown) {
    if (error instanceof Error) {
      toast.error(error?.message || "Failed to load inactive carers");
    } else {
      toast.error("Failed to load inactive carers");
    }
  }
}

export const getDashboardMonthlyBookingsApiCall = async (dateFrom: any, dateTo: any) => {
  try {
    const response = await adminDashboardService.getDashboardMonthlyBookings(dateFrom, dateTo);
    if (!response.isOk) {
      const errorMessage = response.data.message as string;
      toast.error(errorMessage || "Unable to fetch monthly bookings");
    } 
    else {
      return response?.data?.data;
    }
  } 
  catch (error: unknown) {
    if (error instanceof Error) {
      toast.error(error?.message || "Failed to load monthly bookings");
    } else {
      toast.error("Failed to load monthly bookings");
    }
  }
}

export const getDashboardMonthlyBookingsPerServiceApiCall = async (dateFrom: any, dateTo: any) => {
  try {
    const response = await adminDashboardService.getDashboardMonthlyBookingsPerService(dateFrom, dateTo);
    if (!response.isOk) {
      const errorMessage = response.data.message as string;
      toast.error(errorMessage || "Unable to fetch bookings by service");
    } 
    else {
      return response?.data?.data;
    }
  } 
  catch (error: unknown) {
    if (error instanceof Error) {
      toast.error(error?.message || "Failed to load bookings by service");
    } else {
      toast.error("Failed to load bookings by service");
    }
  }
}

export const getDashboardMonthlyBookingsPerCarerApiCall = async (dateFrom: any, dateTo: any) => {
  try {
    const response = await adminDashboardService.getDashboardMonthlyBookingsPerCarer(dateFrom, dateTo);
    if (!response.isOk) {
      const errorMessage = response.data.message as string;
      toast.error(errorMessage || "Unable to fetch bookings by carer");
    } 
    else {
      return response?.data?.data;
    }
  } 
  catch (error: unknown) {
    if (error instanceof Error) {
      toast.error(error?.message || "Failed to load bookings by carer");
    } else {
      toast.error("Failed to load bookings by carer");
    }
  }
}


export const getDashboardNotificationsApiCall = async () => {
  try {
    const response = await adminDashboardService.getDashboardNotifications();
    if (!response.isOk) {
      const errorMessage = response.data.message as string;
      toast.error(errorMessage || "Unable to fetch notifications");
    } 
    else {
      return response?.data?.data;
    }
  } 
  catch (error: unknown) {
    if (error instanceof Error) {
      toast.error(error?.message || "Failed to fetch notifications");
    } else {
      toast.error("Failed to fetch notifications");
    }
  }
}