// MultiBookingContext.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { BookingData } from './BookingContext';

interface MultiBookingContextType {
  allBookings: BookingData[];
  addBooking: (booking: BookingData) => void;
  clearAllBookings: () => void;
  deleteBookingByIndex: (index: string | number) => void;
  editBookingByIndex: (index: number, updatedBooking: BookingData) => void;
  setBookingDescriptionByIndex: (index: number, description: any) => void;
  setRecurringConfigByIndex: (index: number, recurringConfig: any) => void; // <-- Added
}

const MultiBookingContext = createContext<MultiBookingContextType | undefined>(undefined);

export const MultiBookingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [allBookings, setAllBookings] = useState<BookingData[]>([]);

  const addBooking = (booking: BookingData) => {
    setAllBookings(prev => [...prev, booking]);
  };

  const clearAllBookings = () => {
    setAllBookings([]);
  };

  const deleteBookingByIndex = (id: string) => {
    setAllBookings(prev => prev.filter((booking) => booking.id !== id));
  };

  const editBookingByIndex = (index: number, updatedBooking: BookingData) => {
    setAllBookings(prev =>
      prev.map((booking, i) => (i === index ? updatedBooking : booking))
    );
  };

  const setBookingDescriptionByIndex = (index: number, newDescription: string) => {
    setAllBookings(prev => {
      const newBookings = [...prev];
      newBookings[index] = { 
        ...newBookings[index], 
        selectedBookingDescription: newDescription 
      };
      return newBookings;
    });
  };

  // --- Added function ---
  const setRecurringConfigByIndex = (index: number, recurringConfig: any) => {
    setAllBookings(prev => {
      const newBookings = [...prev];
      newBookings[index] = {
        ...newBookings[index],
        recurringConfig
      };
      return newBookings;
    });
  };
  // ----------------------

  return (
    <MultiBookingContext.Provider
      value={{
        allBookings,
        addBooking,
        clearAllBookings,
        deleteBookingByIndex,
        editBookingByIndex,
        setBookingDescriptionByIndex,
        setRecurringConfigByIndex // <-- Added
      }}
    >
      {children}
    </MultiBookingContext.Provider>
  );
};

export const useMultiBookingContext = () => {
  const context = useContext(MultiBookingContext);
  if (!context) throw new Error("useMultiBookingContext must be used within a MultiBookingProvider");
  return context;
};