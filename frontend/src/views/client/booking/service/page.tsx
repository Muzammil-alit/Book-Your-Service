'use client'

import React, { useState, useEffect } from 'react'
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  styled,
  Button
} from '@mui/material'
import { useRouter } from 'next/navigation'
import BookingStepper from '../stepper/BookingStepper'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import { getClientServicesApiCall } from '../actions'


import { useBookingContext } from '@/app/(dashboard)/(private)/client/context/BookingContext'
import { useMultiBookingContext } from '@/app/(dashboard)/(private)/client/context/MultiBookingContext'

// Initialize dayjs plugins
dayjs.extend(utc)
dayjs.extend(timezone)

// Styled components
const GlassPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  display: 'flex',
  flexDirection: 'column',
  background: 'rgba(255, 255, 255, 0.7)',
  backdropFilter: 'blur(10px)',
  WebkitBackdropFilter: 'blur(10px)',
  borderRadius: '16px',
  border: '1px solid rgba(255, 255, 255, 0.18)',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
  transition: 'all 0.3s ease',
  position: 'relative',
  overflow: 'hidden',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 15px 30px rgba(0, 0, 0, 0.15)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    background: 'linear-gradient(90deg, #4caf50 0%, #2e7d32 100%)',
    opacity: 0,
    transition: 'opacity 0.3s ease',
  },
  '&:hover::before': {
    opacity: 1,
  }
}))

const ServiceCard = styled(GlassPaper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  display: 'flex',
  flexDirection: 'column',
  transition: 'all 0.3s ease',
}))

const AnimatedBox = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'delay'
})<{ delay?: number }>(({ delay = 0 }) => ({
  animation: `fadeInUp 0.5s ease-out ${delay}s both`,
  '@keyframes fadeInUp': {
    '0%': { opacity: 0, transform: 'translateY(20px)' },
    '100%': { opacity: 1, transform: 'translateY(0)' }
  }
}))

const IconWrapper = styled(Box)(({ theme }) => ({
  width: '50px',
  height: '50px',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'linear-gradient(135deg, #4caf50 0%, #2e7d32 100%)',
  color: '#fff',
  fontSize: '1.5rem',
}))

const HighlightText = styled('span')(({ theme }) => ({
  background: 'linear-gradient(90deg, #4caf50 0%, #2e7d32 100%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
  textFillColor: 'transparent',
}))

const DurationButton = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(1.2),
  textAlign: 'center',
  cursor: 'pointer',
  borderRadius: '8px',
  transition: 'all 0.2s ease',
  background: 'rgba(255, 255, 255, 0.9)',
  border: '1px solid rgba(76, 175, 80, 0.2)',
  width: '100%',
  '&:hover': {
    background: 'rgba(76, 175, 80, 0.05)',
    transform: 'translateY(-1px)',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
  },
  '&.selected': {
    background: 'rgba(76, 175, 80, 0.25)',
    borderColor: 'rgba(76, 175, 80, 0.6)',
    boxShadow: '0 2px 8px rgba(76, 175, 80, 0.2)',
    color: '#2e7d32',
  }
}))

// Updated types to match API
interface Duration {
  ServiceDurationID: number;
  Duration: number;
  ShiftStartTime: string;
  ShiftEndTime: string;
}

interface Service {
  ServiceID: number;
  ServiceName: string;
  Descr: string;
  ServiceDurationType: boolean;
  Durations: Duration[];
}


const ServiceSelection = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [selectedDuration, setSelectedDuration] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(`${Intl.DateTimeFormat().resolvedOptions().timeZone} ${dayjs().format('h:mm:ss A')}`);
  const router = useRouter();
  const activeStep = 0;
  const { bookingData, updateBookingData, clearBookingData } = useBookingContext();
  const { allBookings, clearAllBookings } = useMultiBookingContext()

  useEffect(() => {
    if (bookingData.selectedServiceId && bookingData.selectedDuration) {
      setSelectedDuration(`${bookingData.selectedServiceId}-${bookingData.selectedDurationId}`);
    }
  }, [bookingData]);

  // Add browser reload warning
  useEffect(() => {
    let shouldRedirect = false;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      const message = "You have unsaved changes. Your progress will be lost if you leave or reload the page.";
      e.preventDefault();
      e.returnValue = message;
      shouldRedirect = true; // Set flag if warning is shown
      return message;
    };

    const handleUnload = () => {
      if (shouldRedirect) {
        // This won't work directly in unload, but we can use localStorage
        localStorage.setItem('shouldRedirect', 'true');
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('unload', handleUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('unload', handleUnload);
    };
  }, []);

  useEffect(() => {
    // Check on component mount if we need to redirect
    if (localStorage.getItem('shouldRedirect') === 'true') {
      localStorage.removeItem('shouldRedirect');
      router.push('/client/booking/service');
    }
  }, [router]);




  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(`${Intl.DateTimeFormat().resolvedOptions().timeZone} ${dayjs().format('h:mm:ss A')}`);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const data = await getClientServicesApiCall();
      if (data) {
        setServices(data as Service[]);
      }
    };
    fetchData();
  }, []);


  const handleDurationSelect = (durationId: string) => {
    setSelectedDuration(durationId);


    const [serviceId, durationIdStr] = durationId.split('-');
    const selectedService = services.find(s => s.ServiceID.toString() === serviceId);
    const selectedDuration = selectedService?.Durations.find(d => d.ServiceDurationID.toString() === durationIdStr)


    if (selectedService) {
      updateBookingData({
        selectedServiceId: parseInt(serviceId),
        selectedDurationId: parseInt(durationIdStr),
        selectedDuration: selectedDuration.Duration,
        selectedServiceName: selectedService.ServiceName,
        selectedServiceDescription: selectedService.Descr
      });
    }

    router.push('/client/booking/timeslot');
  };

  const handleBackToDashboard = () => {
    clearBookingData();
    clearAllBookings()
    router.push('/client/dashboard');
  };


  var flag = 0

    


  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 6, display: 'flex', justifyContent: 'flex-start' }}>
        <Button
          variant="outlined"
          color="primary"
          size="small"
          startIcon={<i className="ri-arrow-left-line" />}
          onClick={handleBackToDashboard}
        >
          Back to Dashboard
        </Button>
      </Box>

      <BookingStepper activeStep={activeStep} />

      <AnimatedBox delay={0.2}>
        <Box
          sx={{
            mb: 4,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', md: 'center' },
            flexDirection: { xs: 'column', sm: 'row' }, // Flex column on small screens
            gap: 2 // Optional: add spacing between stacked items on small screens
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconWrapper sx={{ mr: 2, fontSize: 24 }}>
              <i className="ri-service-line" />
            </IconWrapper>
            <Box>
              <Typography variant="h4" style={{ marginBottom: 0 }} fontWeight={600} gutterBottom>
                Select a <HighlightText>Service</HighlightText>
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Choose a service and the duration you need
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignSelf: 'flex-end'}}>
            <Typography variant="body2" color="text.secondary">
              {currentTime}
            </Typography>
          </Box>
        </Box>

      </AnimatedBox>

      <AnimatedBox delay={0.3}>
        {services.length === 0 ? (
          <Typography>No services available</Typography>
        ) : (
          <Grid container spacing={3}>
            {services.map((service) => (
              <Grid item xs={12} key={service.ServiceID}>
                <ServiceCard>
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: { xs: 'column', sm: 'row' },
                      justifyContent: 'space-between',
                      alignItems: { xs: 'flex-start', md: 'flex-start' },
                      gap: 2 // Optional: adds spacing between stacked items
                    }}
                  >
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" fontWeight="600" gutterBottom>{service.ServiceName}</Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.4, textAlign: 'justify' }}>
                        {service.Descr}
                      </Typography>
                    </Box>

                    <Box sx={{ 
                      minWidth: {xs: '100%', sm: '42%'}, 
                      pt: 0.5
                      }}>
                      <Grid container spacing={1.5}>
                        {service.Durations.map((duration) => {
                          const durationId = `${service.ServiceID}-${duration.ServiceDurationID}`;


                          if (bookingData.selectedDuration === duration.Duration && bookingData.selectedServiceId === service.ServiceID) {
                            flag = flag + 1
                          }
                          return (
                            <Grid item xs={4} key={duration.ServiceDurationID} sx={{ mb: 1.5 }}>

                              {bookingData.isEditMode ?
                                <>
                                  <DurationButton
                                    className={bookingData.selectedDuration === duration.Duration && bookingData.selectedServiceId === service.ServiceID && flag < 2 ? 'selected' : ''}
                                    onClick={() => handleDurationSelect(durationId)}
                                    elevation={0}
                                  >
                                    <Typography
                                      variant="body2"
                                      fontWeight={bookingData.selectedDuration === duration.Duration && bookingData.selectedServiceId === service.ServiceID && flag < 2 ? 700 : 500}
                                      color={bookingData.selectedDuration === duration.Duration && bookingData.selectedServiceId === service.ServiceID && flag < 2 ? 'primary.dark' : 'inherit'}
                                    >
                                      {duration.Duration} Hours
                                    </Typography>
                                  </DurationButton>
                                </>
                                :
                                <>
                                  <DurationButton
                                    className={selectedDuration === durationId ? 'selected' : ''}
                                    onClick={() => handleDurationSelect(durationId)}
                                    elevation={0}
                                  >
                                    <Typography
                                      variant="body2"
                                      fontWeight={selectedDuration === durationId ? 700 : 500}
                                      color={selectedDuration === durationId ? 'primary.dark' : 'inherit'}
                                    >
                                      {duration.Duration} Hours
                                    </Typography>
                                  </DurationButton>
                                </>

                              }
                            </Grid>
                          );
                        })}
                      </Grid>
                    </Box>
                  </Box>
                </ServiceCard>
              </Grid>
            ))}
          </Grid>
        )}
      </AnimatedBox>
    </Container>
  );
}

export default ServiceSelection;
