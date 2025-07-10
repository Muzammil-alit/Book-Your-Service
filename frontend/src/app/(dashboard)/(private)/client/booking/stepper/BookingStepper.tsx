'use client'

import React from 'react'
import { 
  Box, 
  Stepper, 
  Step, 
  StepLabel, 
  styled,
  Typography
} from '@mui/material'
import { useRouter } from 'next/navigation'


import { useBookingContext } from '../../context/BookingContext'

const AnimatedBox = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'delay'
})<{ delay?: number }>(({ theme, delay = 0 }) => ({
  animation: `fadeInUp 0.5s ease-out ${delay}s both`,
  '@keyframes fadeInUp': {
    '0%': {
      opacity: 0,
      transform: 'translateY(20px)'
    },
    '100%': {
      opacity: 1,
      transform: 'translateY(0)'
    }
  }
}))

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
      ? `${bookingData.selectedDate} | ${formatToAMPM(bookingData.selectedTime)}`
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


  updateStepsWithDelay(bookingData, formatToAMPM, STEPS);



  const handleStepClick = (stepIndex: number) => {
    // Only allow navigation to previous steps or current step
    if (stepIndex <= activeStep) {
      router.push(STEP_PATHS[stepIndex]);
    }
  };

  return (
    // <AnimatedBox delay={0.1}>
      <Stepper 
        activeStep={activeStep} 
        alternativeLabel
        sx={{ mb: 5 }}
      >
        {STEPS.map((label, index) => (
          <Step key={label}>
            <ClickableStepLabel style={{cursor: 'default'}}>
              <Typography 
                sx={{ 
                  opacity: index <= activeStep ? 1 : 0.6,
                  fontWeight: index === activeStep ? 600 : 400
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