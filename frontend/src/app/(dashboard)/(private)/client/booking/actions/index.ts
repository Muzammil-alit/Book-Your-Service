
import { ClientBookingService } from '@/api/services/ClientBookingServices';
import { toast } from 'react-toastify';
import  { Dayjs } from 'dayjs';


const clientBookingService = new ClientBookingService()

export const getClientServicesApiCall = async () => {
  try {
    const response = await clientBookingService.getClientServices();
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
};

export const getTimeslotsApiCall = async (serviceID: number, serviceDurationID: number, bookingDate: Dayjs | string | null, bookingID: any) => {
  try {
    const response = await clientBookingService.getTimeslots(serviceID, serviceDurationID, bookingDate, bookingID);
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
};

export const getClientCarerApiCall = async (serviceID: number, duration: number, bookingDateTime: string, bookingID?: any) => {
  try {
    if (!serviceID || !duration) {
      return 
    }
    const response = await clientBookingService.getClientCarer(serviceID, duration, bookingDateTime, bookingID);
    if (!response.isOk) {
      const errorMessage = response.data.message as string;
      // toast.error(errorMessage || "Unable to fetch activity logs");
    } 
    else {
      return response?.data?.data
    }
  } 
  
  catch (error: unknown) {
    if (error instanceof Error) {
      // toast.error(error?.message || "Something went wrong");
    } else {
      // toast.error("Something went wrong");
    }
  }
}

export const confirmBookingApiCall = async (bookingData: object) => {
  try {
    const response = await clientBookingService.confirmBooking(bookingData);
    if (!response.isOk) {
      const errorMessage = response.data.message as string;
      toast.error(errorMessage || "Something went wrong");
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

export const getMyBookingsApiCall = async (clientID: number) => {
  try {
    const response = await clientBookingService.getMyBookings(clientID);
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


export const deleteBookingApiCall = async (bookingID: number) => {
  try {
    const response = await clientBookingService.deleteBooking(bookingID);
    if (!response.isOk) {
      const errorMessage = response.data.message as string;
      toast.error(errorMessage || "Unable to fetch activity logs");
    } 
    else {
      toast.success('Booking deleted succesfully')
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

export const updateBookingApiCall = async (bookingData: any) => {
  try {
    const response = await clientBookingService.updateBooking(bookingData[0].selectedBookingID, bookingData);
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


export const getBookingbyIDApiCall = async (bookingID: number) => {
  try {
    const response = await clientBookingService.getBookingbyID(bookingID);
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


