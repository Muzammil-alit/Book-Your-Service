
import { ClientBookingService } from '@/api/services/ClientBookingServices';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';


import axios from 'axios';

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


export const getAvailableDates = async (serviceID: number | null, bookingID: any) => {
  try {
    if (!serviceID) {
      return
    } 
    const response = await clientBookingService.getAvailableDates(serviceID, bookingID);
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
};



export const getTimeslotsApiCall = async (serviceID: number, serviceDurationID: number, bookingDate: string, bookingID: any) => {
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
    const response = await clientBookingService.getClientCarer(serviceID, duration, bookingDateTime, bookingID);
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

export const confirmBookingApiCall = async (bookingData: any, carerName: string, loggedInUser: any) => {
    
    
  try {
    const response = await clientBookingService.confirmBooking(bookingData);
    if (!response.isOk) {
      const errorMessage = response.data.message as string;
      toast.error(errorMessage || "Something went wrong");
    }
    else {

      const extBookingDate = dayjs(bookingData[0].bookingDateTime).format('YYYY-MM-DDTHH:mm:ss')


      const externalApiData = {
        client_email: loggedInUser?.emailID,
        client_phone: loggedInUser?.clientPhoneNo,
        client_name: loggedInUser?.firstName + " " + loggedInUser?.lastName,
        event_type: "One time",
        carer_name: carerName,
        start_date_time: extBookingDate,
        additional_fields: [
          {
            value: bookingData[0].descr,
          }
        ]
      }

      if (!process.env.NEXT_PUBLIC_SUPPORT_BOOKING_URL) {
        toast.error('NEXT_PUBLIC_SUPPORT_BOOKING_URL is missing in the env')
        return
      }

      axios.post(
        process.env.NEXT_PUBLIC_SUPPORT_BOOKING_URL, externalApiData)
        .then((res) => {
            
        })
        .catch((error) => {
          console.error('Error:', error);
        });


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


