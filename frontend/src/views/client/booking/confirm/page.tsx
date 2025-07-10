'use client'

import React, { useState, useEffect } from 'react'
import {
  Box,
  Container,
  Typography,
  Button,
  Divider,
  Paper,
  styled,
  Modal,
  Fade,
  Backdrop,
  Grid,
  TextField,
  FormControlLabel,
  Checkbox,
  MenuItem,
  Select,
  FormControl,
  InputLabel
} from '@mui/material'
import { useRouter } from 'next/navigation'
import BookingStepper from '../stepper/BookingStepper'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import { Icon } from '@mui/material'
import { useDispatch, useSelector } from 'react-redux'
import { useAppSelector } from '@/redux/useAppSelector'
import { confirmBookingApiCall, updateBookingApiCall } from '../actions'
import { toast } from 'react-toastify'

import { useBookingContext } from '@/contexts/bookingContexts/BookingContext'
import { useMultiBookingContext } from '@/contexts/bookingContexts/MultiBookingContext'
import { useMediaQuery, useTheme } from '@mui/material';

// Initialize dayjs plugins
dayjs.extend(utc)
dayjs.extend(timezone)

// Styled components
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

// Modal styled components
const ModalContent = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '90%',
  maxWidth: '600px',
  padding: 0,
  boxShadow: '0 24px 48px rgba(0, 0, 0, 0.2)',
  borderRadius: '16px',
  outline: 'none',
  overflow: 'hidden',
  background: 'white',
}))

const ModalBody = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  maxHeight: 'calc(100vh - 200px)',
  overflowY: 'auto',
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

const ButtonContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  gap: theme.spacing(2),
  marginTop: theme.spacing(4),
}))




function InlineSuccessAnimation() {
  return (
    <div style={{ display: 'inline-block' }}>
      <svg
        viewBox="0 0 60 60"
        style={{
          width: '120px',
          height: '120px',
          stroke: '#4caf50',
          strokeWidth: 3,
          fill: 'none',
          transformOrigin: 'center',
          animation: 'scaleUp 0.8s ease-out',
        }}
      >
        <circle
          cx="25"
          cy="25"
          r="24"
          strokeDasharray="157"
          strokeDashoffset="157"
          style={{
            animation: 'drawCircle 1.5s ease-out forwards',
          }}
        />
        <path
          d="M14 27l7 7 16-16"
          strokeDasharray="38"
          strokeDashoffset="38"
          style={{
            animation: 'drawCheck 1s ease-out 1.2s forwards',
          }}
        />
        <style>{`
          @keyframes drawCircle {
            to {
              stroke-dashoffset: 0;
            }
          }

          @keyframes drawCheck {
            to {
              stroke-dashoffset: 0;
            }
          }

          @keyframes scaleUp {
            0% {
              transform: scale(0.7);
              opacity: 0;
            }
            60% {
              transform: scale(1.05);
              opacity: 1;
            }
            100% {
              transform: scale(1);
            }
          }
        `}</style>
      </svg>
    </div>
  );
}

export const formatToAMPM = (timeStr: string): string => {
  const [hoursStr, minutesStr] = timeStr.split(':');
  const hours = parseInt(hoursStr, 10);
  const minutes = parseInt(minutesStr, 10);

  const period = hours >= 12 ? 'PM' : 'AM';
  const formattedHours = hours % 12 === 0 ? 12 : hours % 12;

  return `${formattedHours}:${minutes.toString().padStart(2, '0')} ${period}`;
};


const DescriptionWithToggle = ({ description }) => {
  const [expanded, setExpanded] = useState(false);

  const words = description.trim().split(/\s+/);
  const isLong = words.length > 36;
  const shortText = words.slice(0, 36).join(' ');

  const displayText = isLong && !expanded ? `${shortText}... ` : description + ' ';

  return (
    <Typography variant="body1" sx={{ textJustify: 'auto' }}>
      {displayText}
      {isLong && (
        <Box
          component="span"
          sx={{
            color: 'primary.main',
            fontWeight: 500,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            display: 'inline',
            ml: 0.5
          }}
          onClick={() => setExpanded(prev => !prev)}
        >
          <span style={{ fontSize: '12px' }}>
            {expanded ? 'Read less' : 'Read more'}
          </span>
        </Box>
      )}
    </Typography>
  );
};






const ConfirmBooking = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(`${Intl.DateTimeFormat().resolvedOptions().timeZone} ${dayjs().format('h:mm:ss A')}`);

  const { bookingData, clearBookingData, updateBookingData } = useBookingContext();
  const { allBookings, addBooking, clearAllBookings, deleteBookingByIndex, setBookingDescriptionByIndex, setRecurringConfigByIndex } = useMultiBookingContext();

  // Recurring config state per booking
  const [recurringConfigs, setRecurringConfigs] = useState(() =>
    allBookings.map(item => {
      // If recurringBookingConfig exists, use it, else fallback to legacy fields
      if (item.recurringConfig) {
        return { ...item.recurringConfig };
      }
      else {
        return {
          isRecurring: !!item.recurringBookingID,
          repeatFrequency: (() => {
            switch (item.frequencyInterval) {
              case 1: return 'daily';
              case 2: return 'weekly';
              case 3: return 'fortnightly';
              case 4: return 'monthly';
              default: return 'weekly';
            }
          })(),
          durationOption: (() => {
            if (item.frequencyDuration && item.frequencyType) {
              const type =
                item.frequencyType === 1 ? 'Week' :
                  item.frequencyType === 2 ? 'Month' :
                    item.frequencyType === 3 ? 'Year' : 'Week';
              const duration = `${item.frequencyDuration} ${type}`;
              const isCustom = ![
                '1 Week', '2 Week', '3 Week',
                '1 Month', '2 Month', '3 Month', '6 Month'
              ].includes(duration);
              if (isCustom) return 'Custom';
              return duration;
            }
            return '1 Month';
          })(),
          customDuration: item.frequencyDuration || 1,
          customRange: item.frequencyType === 1 ? 'week' : 'month'
        };

      }
    })
  );


  const [arrayIndex, setArrayIndex] = useState<number | null>(null);

  const [desc, setDesc] = useState(allBookings.map(item => item.selectedBookingDescription || ''));
  // Modal and confirmation
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [deleteKey, setDeleteKey] = useState('');

  const activeStep = 3; // Fourth step (Confirm)
  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up('md'));
  const buttonSize = isMdUp ? 'medium' : 'small';

  // Recurring options
  const repeatOptions = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'fortnightly', label: 'Every Second Week (Fortnightly)' },
    { value: 'monthly', label: 'Monthly' }
  ];

  const durationOptions = {
    daily: [
      '1 Week', '2 Week', '3 Week',
      '1 Month', '2 Month', '3 Month', '6 Month',
      'Custom'
    ],
    weekly: [
      '2 Week', '3 Week',
      '1 Month', '2 Month', '3 Month', '6 Month',
      'Custom'
    ],
    fortnightly: [
      '1 Month', '2 Month', '3 Month', '6 Month',
      'Custom'
    ],
    monthly: [
      '2 Month', '3 Month', '6 Month',
      'Custom'
    ]
  };

  // Prefill recurring config if page is revisited or bookings change
  // useEffect(() => {
  //   setRecurringConfigs(
  //     allBookings.map(item => {
  //       if (item.recurringBookingConfig) {
  //         return { ...item.recurringBookingConfig };
  //       }
  //       return {
  //         isRecurring: !!item.recurringBookingID,
  //         repeatFrequency: (() => {
  //           switch (item.frequencyInterval) {
  //             case 1: return 'daily';
  //             case 2: return 'weekly';
  //             case 3: return 'fortnightly';
  //             case 4: return 'monthly';
  //             default: return 'weekly';
  //           }
  //         })(),
  //         durationOption: (() => {
  //           if (item.frequencyDuration && item.frequencyType) {
  //             const type =
  //               item.frequencyType === 1 ? 'Week' :
  //               item.frequencyType === 2 ? 'Month' :
  //               item.frequencyType === 3 ? 'Year' : 'Week';
  //             const duration = `${item.frequencyDuration} ${type}`;
  //             const isCustom = ![
  //               '1 Week', '2 Week', '3 Week',
  //               '1 Month', '2 Month', '3 Month', '6 Month'
  //             ].includes(duration);
  //             if (isCustom) return 'Custom';
  //             return duration;
  //           }
  //           return '1 Month';
  //         })(),
  //         customDuration: item.frequencyDuration || 1,
  //         customRange: item.frequencyType === 1 ? 'week' : 'month'
  //       };
  //     })
  //   );
  //   setDesc(allBookings.map(item => item.selectedBookingDescription || ''));
  // }, [allBookings]);

  // Calculate end date based on selections
  const calculateEndDate = (bookingIdx: number) => {
    const config = recurringConfigs[bookingIdx];
    const booking = allBookings[bookingIdx];
    const startDate = booking.initialStartDate ? dayjs(booking.initialStartDate) : dayjs(booking.selectedDate);
    let endDate = startDate;

    if (config.durationOption === 'Custom') {
      if (config.customRange === 'week') {
        endDate = startDate.add(config.customDuration, 'week');
      } else {
        endDate = startDate.add(config.customDuration, 'month');
      }
    } else {
      if (config.durationOption.includes('Week')) {
        const week = parseInt(config.durationOption);
        endDate = startDate.add(week, 'week');
      } else if (config.durationOption.includes('Month')) {
        const month = parseInt(config.durationOption);
        endDate = startDate.add(month, 'month');
      }
    }
    endDate = endDate.subtract(1, 'day');
    return endDate.format('MMMM D, YYYY');
  };

  // Generate recurring message based on selections
  const generateRecurringMessage = (bookingIdx: number) => {
    const config = recurringConfigs[bookingIdx];
    const booking = allBookings[bookingIdx];
    const startDate = booking.initialStartDate ? dayjs(booking.initialStartDate) : dayjs(booking.selectedDate);
    const timeSlot = dayjs(booking.selectedTime).utc().format('hh:mm A');
    const dayName = startDate.format('dddd');
    const endDate = calculateEndDate(bookingIdx);

    const Bold = ({ children }: { children: React.ReactNode }) => (
      <span className="font-semibold">&nbsp;{children}&nbsp;</span>
    );

    switch (config.repeatFrequency) {
      case 'daily':
        return (
          <>
            Starts from <Bold>{startDate.format('MMMM D, YYYY')}</Bold> and repeats every day at <Bold>{timeSlot}</Bold> up to <Bold>{endDate}</Bold>
          </>
        );
      case 'weekly':
        return (
          <>
            Starts from <Bold>{startDate.format('MMMM D, YYYY')}</Bold> and repeats every <Bold>{dayName}</Bold> at <Bold>{timeSlot}</Bold> up to <Bold>{endDate}</Bold>
          </>
        );
      case 'fortnightly':
        return (
          <>
            Starts from <Bold>{startDate.format('MMMM D, YYYY')}</Bold> and repeats every second week on <Bold>{dayName}</Bold> at <Bold>{timeSlot}</Bold> up to <Bold>{endDate}</Bold>
          </>
        );
      case 'monthly':
        return (
          <>
            Starts from <Bold>{startDate.format('MMMM D, YYYY')}</Bold> and repeats every month on the <Bold>{startDate.format('D')}'th</Bold> at <Bold>{timeSlot}</Bold> up to <Bold>{endDate}</Bold>
          </>
        );
      default:
        return '';
    }
  };

  // Add browser reload warning
  useEffect(() => {
    let shouldRedirect = false;
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      const message = "You have unsaved changes. Your progress will be lost if you leave or reload the page.";
      e.preventDefault();
      e.returnValue = message;
      shouldRedirect = true;
      return message;
    };
    const handleUnload = () => {
      if (shouldRedirect) {
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
    if (localStorage.getItem('shouldRedirect') === 'true') {
      localStorage.removeItem('shouldRedirect');
      router.push('/client/booking/service');
    }
  }, [router]);

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(`${Intl.DateTimeFormat().resolvedOptions().timeZone} ${dayjs().format('h:mm:ss A')}`);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleBookingSuccess = () => {
    clearBookingData();
    clearAllBookings();
    router.push('/client/dashboard');
  };

  const handleBackToDashboard = () => {
    clearBookingData();
    clearAllBookings();
    router.push('/client/dashboard');
  };

  // Save recurring config to context on add more services
  const handleAddMoreServices = (bookingData: any, idx: number) => {


    // Save current recurring config for this booking
    setRecurringConfigByIndex(idx, recurringConfigs[idx]);
    // Also save recurring config into booking object for prefill on revisit
    // addBooking({
    //   ...bookingData,
    //   recurringBookingConfig: recurringConfigs[idx]
    // });


    clearBookingData();
    router.push('/client/booking/service');
  };

  const clientID = useAppSelector((state: any) => state?.authReducer?.client?.user?.clientID);
  const loggedInUser = useSelector((state: any) => state.authReducer?.client?.user);

  const handleConfirmBooking = async () => {
    try {
      if (allBookings.length === 0) {
        toast.error('Please select at least one service');
        return;
      }
      setIsLoading(true);

      // Save all recurring configs to context before confirming
      // recurringConfigs.forEach((config, idx) => setRecurringConfigByIndex(idx, config));

      const bookingDataToPost = allBookings.map((item, idx) => {
        const config = recurringConfigs[idx];
        let frequencyInterval: any = config.repeatFrequency;
        let frequencyDuration: any;
        let frequencyType: any;

        if (config.durationOption === 'Custom') {
          frequencyDuration = config.customDuration;
          frequencyType = config.customRange;
        } else {
          frequencyDuration = config.durationOption.split(' ')[0];
          frequencyType = config.durationOption.split(' ')[1].toLocaleLowerCase();
        }

        switch (frequencyInterval) {
          case 'daily': frequencyInterval = 1; break;
          case 'weekly': frequencyInterval = 2; break;
          case 'fortnightly': frequencyInterval = 3; break;
          case 'monthly': frequencyInterval = 4; break;
        }
        switch (frequencyType) {
          case 'week': frequencyType = 1; break;
          case 'month': frequencyType = 2; break;
          case 'year': frequencyType = 3; break;
        }

        return {
          bookingDateTime: item.selectedDate + " " + item.selectedTime.split('T')[1],
          clientID: clientID,
          serviceID: item.selectedServiceId,
          carerID: item.selectedProviderId,
          duration: item.selectedDuration,
          descr: item.selectedBookingDescription,
          selectedBookingID: bookingData.isEditMode ? item.selectedBookingID : null,
          isRecurring: config.isRecurring,
          frequencyInterval: config.isRecurring ? parseInt(frequencyInterval) : null,
          frequencyDuration: config.isRecurring ? parseInt(frequencyDuration) : null,
          frequencyType: config.isRecurring ? parseInt(frequencyType) : null
        };
      });

      let result;
      if (!bookingData.isEditMode) {
        result = await confirmBookingApiCall(bookingDataToPost, bookingData?.selectedProviderName, loggedInUser);
      } else {
        result = await updateBookingApiCall(bookingDataToPost);
      }

      if (result) {
        handleConfirmationOpen();
        setTimeout(() => {
          clearAllBookings();
          clearBookingData();
          router.push('/client/dashboard');
        }, 3000);
      }
    } catch (err) {
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = (id: any, key: any) => {
    setModalOpen(true);
    setDeleteKey(id);
    setArrayIndex(key);
    
  };

  const handleDeleteConfirm = () => {
    setDesc(prev => prev.filter((_, index) => index !== arrayIndex));
    deleteBookingByIndex(deleteKey);
    setModalOpen(false);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  const handleConfirmationOpen = () => {
    setConfirmationOpen(true);
  };

  const handleConfirmationClose = () => {
    setConfirmationOpen(false);
  };

  const handleEdit = (key: number, id: string) => {
    // Save current recurring config for this booking
    setRecurringConfigByIndex(key, recurringConfigs[key]);
    // Also save recurring config into booking object for prefill on revisit
    updateBookingData({
      ...allBookings[key],
      recurringBookingConfig: recurringConfigs[key]
    });
    setDesc(prev => prev.filter((_, index) => index !== arrayIndex));
    deleteBookingByIndex(id);
    router.push('/client/booking/service');
  };


  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Back to Dashboard Button */}
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

      {/* Use the common BookingStepper component */}
      <BookingStepper activeStep={activeStep} />

      <AnimatedBox delay={0.2}>
        <Box
          sx={{
            mb: 4,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', md: 'center' },
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 2
          }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconWrapper sx={{ mr: 2, fontSize: 24 }}>
              <i className="ri-check-line" />
            </IconWrapper>
            <Box>
              <Typography variant="h4" style={{ marginBottom: 0 }} fontWeight={600} gutterBottom>
                <HighlightText>Confirm</HighlightText> Booking Request
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Review and confirm your booking details
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', alignSelf: 'end' }}>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Local Time: {currentTime}
              </Typography>
            </Box>
          </Box>
        </Box>
      </AnimatedBox>

      <AnimatedBox delay={0.3}>
        {allBookings.map((bookingData, key) => (
          <React.Fragment key={bookingData?.BookingID || key}>
            <Paper sx={{ p: 4, boxShadow: 2, borderRadius: 2, mb: 4 }}>
              <Grid container spacing={4}>
                {/* Left Column – Service Details */}
                <Grid item xs={12} md={5}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Icon className="ri-service-line" sx={{ color: 'primary.main', mr: 1, fontSize: 20 }} />
                    <Typography variant="h6" fontWeight={600}>Service Details</Typography>
                  </Box>
                  <Divider sx={{ mb: 2 }} />

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Service Name</Typography>
                      <Typography variant="body1" fontWeight={500}>
                        {bookingData.selectedServiceName || 'Not selected'}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="body2" color="text.secondary">Duration</Typography>
                      <Typography variant="body1" fontWeight={500}>
                        {bookingData.selectedDuration || 'Not selected'} Hours
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="body2" color="text.secondary">Description</Typography>
                      <DescriptionWithToggle description={bookingData.selectedServiceDescription || 'No description available'} />
                    </Box>
                  </Box>
                </Grid>

                <Grid xs={12} md={1}></Grid>

                {/* Right Column – Schedule */}
                <Grid item xs={12} md={5}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Icon className="ri-calendar-line" sx={{ color: 'primary.main', mr: 1, fontSize: 20 }} />
                    <Typography variant="h6" fontWeight={600}>Schedule</Typography>
                  </Box>
                  <Divider sx={{ mb: 2 }} />
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Date & Time</Typography>
                      <Typography variant="body1" fontWeight={500}>
                        {bookingData.selectedDate
                          ? `${dayjs(bookingData.selectedDate).format('dddd, D MMMM YYYY')}, ${dayjs(bookingData.selectedTime).utc().format('hh:mm A') || 'Not selected'}`
                          : 'Not selected'}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Carer</Typography>
                      <Typography variant="body1" fontWeight={500}>
                        {bookingData.selectedProviderName || 'Not selected'}
                      </Typography>
                    </Box>

                    <Box>
                      <TextField
                        id="description"
                        label='Description/Instructions'
                        multiline
                        rows={4}
                        variant="outlined"
                        fullWidth
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '8px',
                            marginTop: '5px'
                          },
                        }}
                        value={desc[key]}
                        onChange={(e) => {
                          setDesc(prev => {
                            const newDesc = [...prev];
                            newDesc[key] = e.target.value;
                            return newDesc;
                          });
                          setBookingDescriptionByIndex(key, e.target.value);
                        }}
                      />
                    </Box>
                  </Box>
                </Grid>

                {!bookingData.isEditMode && (
                  <Grid item xs={12} md={1} sx={{ display: 'flex', justifyContent: 'end', alignItems: 'start' }}>
                    <Box>
                      <Icon
                        onClick={() => { handleEdit(key, bookingData.id) }}
                        className="ri-edit-line"
                        sx={{ color: '#5FB3D3', mr: 3, fontSize: 24, cursor: 'pointer' }}
                      />
                    </Box>
                    <Box>
                      <Icon
                        onClick={() => { handleDelete(bookingData.id, key) }}
                        className="ri-delete-bin-line"
                        sx={{ color: 'error.main', fontSize: 24, cursor: 'pointer' }}
                      />
                    </Box>
                  </Grid>
                )}
              </Grid>

              {/* Recurring Booking Configuration */}
              <Box sx={{ mt: 4 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={recurringConfigs[key]?.isRecurring}
                      onChange={(e) => {
                        setRecurringConfigs(prev => {
                          const arr = [...prev];
                          arr[key] = { ...arr[key], isRecurring: e.target.checked };
                          return arr;
                        });
                      }}
                      color="primary"
                    />
                  }
                  label="Make it a recurring booking?"
                />

                {recurringConfigs[key]?.isRecurring && (
                  <Grid>
                    <div className={`flex flex-nowrap justify-between items-start  my-2`}>
                      {/* Repeat */}
                      <div
                        className="flex-shrink-0 transition-all duration-400 ease-in-out"
                        style={{
                          width: recurringConfigs[key].durationOption === 'Custom' ? '24%' : '49%',
                          minWidth: '200px',
                        }}
                      >
                        <FormControl fullWidth>
                          <InputLabel>Repeat</InputLabel>
                          <Select
                            value={recurringConfigs[key].repeatFrequency}
                            onChange={(e) => {
                              setRecurringConfigs(prev => {
                                const arr = [...prev];
                                arr[key] = { ...arr[key], repeatFrequency: e.target.value, durationOption: '1 Month' };
                                return arr;
                              });
                            }}
                            label="Repeat"
                          >
                            {repeatOptions.map((option) => (
                              <MenuItem key={option.value} value={option.value}>
                                {option.label}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </div>

                      {/* For */}
                      <div
                        className="flex-shrink-0 transition-all duration-400 ease-in-out"
                        style={{
                          width: recurringConfigs[key].durationOption === 'Custom' ? '24%' : '49%',
                          minWidth: '200px',
                        }}
                      >
                        <FormControl fullWidth>
                          <InputLabel>For</InputLabel>
                          <Select
                            value={recurringConfigs[key].durationOption}
                            onChange={(e) => {
                              setRecurringConfigs(prev => {
                                const arr = [...prev];
                                arr[key] = { ...arr[key], durationOption: e.target.value };
                                return arr;
                              });
                            }}
                            label="For"
                            error={recurringConfigs[key].durationOption === ''}
                            helperText={
                              recurringConfigs[key].durationOption === ''
                                ? 'Duration is required'
                                : ''
                            }
                          >
                            {durationOptions[recurringConfigs[key].repeatFrequency as keyof typeof durationOptions]?.map((option) => (
                              <MenuItem key={option} value={option}>
                                {parseInt(option.split(' ')[0]) > 1 ? option + 's' : option}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </div>

                      {/* Range */}
                      <div
                        className="flex-shrink-0 transition-all duration-400 ease-in-out"
                        style={{
                          width: '24%',
                          minWidth: '200px',
                          visibility: recurringConfigs[key].durationOption === 'Custom' ? 'visible' : 'hidden',
                          opacity: recurringConfigs[key].durationOption === 'Custom' ? 1 : 0,
                          position: recurringConfigs[key].durationOption === 'Custom' ? 'relative' : 'absolute',
                        }}
                      >
                        <FormControl fullWidth>
                          <InputLabel>Range</InputLabel>
                          <Select
                            value={recurringConfigs[key].customRange}
                            onChange={(e) => {
                              setRecurringConfigs(prev => {
                                const arr = [...prev];
                                arr[key] = { ...arr[key], customRange: e.target.value };
                                return arr;
                              });
                            }}
                            label="Range"
                          >
                            <MenuItem value="week">Weeks</MenuItem>
                            <MenuItem value="month">Months</MenuItem>
                          </Select>
                        </FormControl>
                      </div>

                      {/* Duration */}
                      <div
                        className="flex-shrink-0 transition-all duration-400 ease-in-out"
                        style={{
                          width: '24%',
                          minWidth: '200px',
                          visibility: recurringConfigs[key].durationOption === 'Custom' ? 'visible' : 'hidden',
                          opacity: recurringConfigs[key].durationOption === 'Custom' ? 1 : 0,
                          position: recurringConfigs[key].durationOption === 'Custom' ? 'relative' : 'absolute',
                        }}
                      >
                        <TextField
                          fullWidth
                          type="number"
                          label="Duration"
                          value={recurringConfigs[key].customDuration}
                          onChange={(e) => {
                            const value = e.target.value;
                            const parsed = parseInt(value, 10);
                            const min = 1;
                            const max = recurringConfigs[key].customRange === 'week' ? 24 : 6;
                            setRecurringConfigs(prev => {
                              const arr = [...prev];
                              arr[key] = {
                                ...arr[key],
                                customDuration:
                                  value === ''
                                    ? ''
                                    : (!isNaN(parsed) && parsed >= min && parsed <= max ? parsed : arr[key].customDuration)
                              };
                              return arr;
                            });
                          }}
                          error={
                            recurringConfigs[key].customDuration === '' ||
                            recurringConfigs[key].customDuration < 1 ||
                            recurringConfigs[key].customDuration > (recurringConfigs[key].customRange === 'week' ? 24 : 6)
                          }
                          helperText={
                            recurringConfigs[key].customDuration === ''
                              ? 'Duration is required'
                              : recurringConfigs[key].customDuration < 1
                                ? 'Minimum is 1'
                                : recurringConfigs[key].customDuration > (recurringConfigs[key].customRange === 'week' ? 24 : 6)
                                  ? `Maximum is ${recurringConfigs[key].customRange === 'week' ? 24 : 6}`
                                  : ''
                          }
                          inputProps={{
                            min: 1,
                            max: recurringConfigs[key].customRange === 'week' ? 24 : 6,
                          }}
                        />
                      </div>
                    </div>
                    {/* Recurring Message */}
                    {allBookings.length > 0 && (
                      <Typography variant="body1" className='flex items-center mt-4'>
                        <i className="ri-time-line mr-1 pb-[1px]" style={{ fontSize: '17px' }}></i>
                        {generateRecurringMessage(key)}
                      </Typography>
                    )}
                  </Grid>
                )}
              </Box>
            </Paper>
          </React.Fragment>
        ))}
      </AnimatedBox>

      {recurringConfigs.some(cfg => cfg.isRecurring) && (
        <Typography variant="body1" className='flex items-start ms-4 my-2'>
          <i className="ri-information-line mr-1 pb-[1px] text-info" style={{ fontSize: '24px' }}></i>
          You are requesting a recurring booking. We cannot guarantee the same carer will be at each booking,
          but we will try to ensure it is the same one. You will be notified if there are any changes.
        </Typography>
      )}

      <AnimatedBox delay={0.4}>
        <ButtonContainer>
          {!bookingData.selectedBookingID?.toString().length && (
            <Button
              variant="outlined"
              color="primary"
              size={buttonSize}
              onClick={() => { handleAddMoreServices(bookingData, allBookings.length - 1) }}
            >
              Add more services
            </Button>
          )}

          {allBookings.length !== 0 && (
            <Button
              variant="contained"
              color="primary"
              size={buttonSize}
              disabled={isLoading}
              onClick={handleConfirmBooking}
            >
              {isLoading ? 'Processing...' : 'Request Booking'}
            </Button>
          )}
        </ButtonContainer>

        <Modal
          open={modalOpen}
          onClose={handleCloseModal}
          closeAfterTransition
          BackdropComponent={Backdrop}
          BackdropProps={{
            timeout: 500,
          }}
        >
          <Fade in={modalOpen}>
            <ModalContent>
              <ModalBody>
                <Box sx={{ mb: 3, mx: 2 }}>
                  <Typography variant="h6" className="text-center font-semibold text-red-600" fontWeight={500} gutterBottom>
                    Confirm Deletion
                  </Typography>
                  <Typography variant="body1" sx={{ textAlign: 'center', mt: '2' }} paragraph>
                    Do you really want to delete this booking?
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'center', mx: 2, mt: 6, mb: 0 }}>
                  <Button variant='outlined' color='primary' onClick={handleDeleteConfirm} sx={{ mx: 4 }}>
                    Confirm
                  </Button>
                  <Button variant='outlined' color='error' onClick={handleCloseModal} sx={{ mx: 4 }}>
                    Cancel
                  </Button>
                </Box>
              </ModalBody>
            </ModalContent>
          </Fade>
        </Modal>

        <Modal
          open={confirmationOpen}
          closeAfterTransition
          BackdropComponent={Backdrop}
          BackdropProps={{
            timeout: 500,
            onClick: (e) => e.stopPropagation(),
          }}
        >
          <Fade in={confirmationOpen}>
            <ModalContent>
              <ModalBody>
                <Box sx={{ my: 4, mx: 2, p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <Box>
                    <InlineSuccessAnimation />
                  </Box>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" sx={{ mt: '2' }} paragraph>
                      {bookingData.isEditMode ? 'Your Booking Request Has Been Updated' : 'Your Booking Request/s Has Been Received'}
                    </Typography>
                    <Typography variant="body1" sx={{ mt: '2' }} paragraph>
                      You will receive a confirmation email within 24 hours.
                    </Typography>
                  </Box>
                </Box>
              </ModalBody>
            </ModalContent>
          </Fade>
        </Modal>
      </AnimatedBox>
    </Container>
  );
};

export default ConfirmBooking;