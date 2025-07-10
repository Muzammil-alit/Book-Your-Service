'use client'

import React from 'react'
import {
  Stepper,
  Step,
  StepLabel,
  styled,
  Typography
} from '@mui/material'
import { useRouter } from 'next/navigation'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'


import { useBookingContext } from '@/contexts/bookingContexts/BookingContext'


// Define the booking step paths
const STEP_PATHS = [
  '/client/booking/service',
  '/client/booking/timeslot',
  '/client/booking/provider',
  '/client/booking/confirm'
];

// Define the steps
const STEPS = ['Service', 'Time', 'Carer', 'Confirm'];


// Step labels as components for easier click handling
const ClickableStepLabel = styled(StepLabel)(({ theme }) => ({
  cursor: 'pointer',
  '.MuiStepLabel-labelContainer': {
    '&:hover': {
      color: theme.palette.primary.main,
    }
  }
}));

export const formatToAMPM = (timeStr: string): string => {
  const [hoursStr, minutesStr] = timeStr.split(':');
  const hours = parseInt(hoursStr, 10);
  const minutes = parseInt(minutesStr, 10);

  const period = hours >= 12 ? 'PM' : 'AM';
  const formattedHours = hours % 12 === 0 ? 12 : hours % 12;

  return `${formattedHours}:${minutes.toString().padStart(2, '0')} ${period}`;
};

const updateStepsWithDelay = async (bookingData, formatToAMPM, STEPS) => {
  const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
  const stepValues = [
    (bookingData.selectedServiceName.length && bookingData.selectedDuration.toString().length) ? `${bookingData.selectedServiceName} ${bookingData.selectedDuration.toString().length ? "|" : ''} ${bookingData.selectedDuration} ${bookingData.selectedDuration.toString().length ? "hours" : ''}  ` : 'Service',
    bookingData.selectedTime.length
      ? `${(bookingData.selectedDate.split('T')[0])} | ${dayjs(bookingData.selectedTime).utc().format('hh:mm A')}`
      : 'Time',
    bookingData.selectedProviderName || 'Carer',
  ];

  for (let i = 0; i < stepValues.length; i++) {
    await delay(50); // 300ms delay between updates (customize as needed)
    STEPS[i] = stepValues[i];
  }
};




interface BookingStepperProps {
  activeStep: number;
}

const BookingStepper: React.FC<BookingStepperProps> = ({ activeStep }) => {
  const router = useRouter();
  const { bookingData, updateBookingData, clearBookingData } = useBookingContext();


  dayjs.extend(utc)

  updateStepsWithDelay(bookingData, formatToAMPM, STEPS);




  return (
    // <AnimatedBox delay={0.1}>
    <Stepper
      activeStep={activeStep}
      alternativeLabel
      sx={{
        mb: 5,
        px: { xs: 1, sm: 3, md: 5 }, // Responsive padding
        flexDirection: { xs: 'column', sm: 'row' }, // Stack steps vertically on mobile
        alignItems: { xs: 'flex-start', sm: 'center' },
        gap: { xs: 2, sm: 0 }, // More space between steps vertically
      }}
    >
      {STEPS.map((label, index) => (
        <Step key={label} sx={{ width: { xs: '100%', sm: 'auto' } }}>
          <ClickableStepLabel
            style={{ cursor: 'default' }}
            // onClick={() => handleStepClick(index)}
          >
            <Typography
              sx={{
                fontSize: { xs: '0.8rem', sm: '0.9rem' },
                textAlign: { xs: 'left', sm: 'center' },
                opacity: index <= activeStep ? 1 : 0.6,
                fontWeight: index === activeStep ? 600 : 400,
                width: '100%',
              }}
            >
              {label}
            </Typography>
          </ClickableStepLabel>
        </Step>
      ))}
    </Stepper>

    // </AnimatedBox>
  );
};

export default BookingStepper; 