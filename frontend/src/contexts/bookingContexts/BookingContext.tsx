'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react'

// Define the booking data structure
export interface BookingData {
  id: any;
  selectedServiceId: any;
  selectedDurationId: any;
  selectedDuration: any;
  selectedServiceName: any;
  selectedServiceDescription: any;
  selectedDate: any;
  selectedTime: any;
  selectedProviderId: any;
  selectedProviderName: any;
  selectedBookingDescription: any;
  selectedBookingID: any;
  isEditMode: boolean;
  // Recurring booking fields
  frequencyDuration: any;
  frequencyInterval: any;
  frequencyType: any;
  recurringBookingID: any;
  initialStartDate: any;
  recurringConfig?: any
  recurringBookingConfig?: any;
  BookingID?: any
}

// Initial empty state
const initialBookingData: BookingData = {
  id: '',
  selectedServiceId: '',
  selectedDurationId: '',
  selectedDuration: '',
  selectedServiceName: '',
  selectedServiceDescription: '',
  selectedDate: '',
  selectedTime: '',
  selectedProviderId: '',
  selectedProviderName: '',
  selectedBookingDescription: '',
  selectedBookingID: '',
  isEditMode: false,
  // Initialize recurring booking fields
  frequencyDuration: '',
  frequencyInterval: '',
  frequencyType: '',
  recurringBookingID: '',
  initialStartDate: null,
};

// Context type definition
interface BookingContextType {
  bookingData: BookingData;
  updateBookingData: (data: Partial<BookingData>) => void;
  clearBookingData: () => void;
}

// Create context with default values
const BookingContext = createContext<BookingContextType>({
  bookingData: initialBookingData,
  updateBookingData: () => {},
  clearBookingData: () => {},
})

// Custom hook for easy context usage
export const useBookingContext = () => useContext(BookingContext)

// Provider component
export const BookingProvider = ({ children }: { children: ReactNode }) => {
  let [bookingData, setBookingData] = useState<BookingData>(initialBookingData)

  // Update booking data (merges partial data with existing state)
  const updateBookingData = (data: Partial<BookingData>) => {
    setBookingData(prevData => ({
      ...prevData,
      ...data
    }))
  }

  // Clear all booking data
  const clearBookingData = () => {
    setBookingData(initialBookingData)
  }


  return (
    <BookingContext.Provider value={{ bookingData, updateBookingData, clearBookingData }}>
      {children}
    </BookingContext.Provider>
  )
} 