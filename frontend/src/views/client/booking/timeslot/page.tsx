'use client'

import React, { useState, useEffect } from 'react'
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  styled,
  IconButton,
  Button,
  Menu,
  MenuItem
} from '@mui/material'
import { useRouter } from 'next/navigation'
import dayjs from 'dayjs'
import BookingStepper from '../stepper/BookingStepper'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import { getAvailableDates, getTimeslotsApiCall } from '../actions'


import { useBookingContext } from '@/app/(dashboard)/(private)/client/context/BookingContext'
import { useMultiBookingContext } from '@/app/(dashboard)/(private)/client/context/MultiBookingContext'

// Initialize dayjs plugins
dayjs.extend(utc)
dayjs.extend(timezone)

// Styled components (reusing some from service page)
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
})<{ delay?: number }>(
  ({ theme, delay = 0 }) => ({
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
  })
)

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

const CalendarWrapper = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  border: '1px solid rgba(0, 0, 0, 0.12)',
  borderRadius: '8px',
  background: 'white',
}))

const DayCell = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'isSelected' && prop !== 'isToday' && prop !== 'isCurrentMonth' && prop !== 'isOffDay'
})<{ isSelected?: boolean; isToday?: boolean; isCurrentMonth?: boolean; isOffDay?: boolean }>(
  ({ theme, isSelected, isToday, isCurrentMonth, isOffDay }) => ({
    width: '36px',
    height: '36px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    cursor: 'pointer',
    fontWeight: isToday ? 600 : 400,
    border: isToday ? '2px solid #2e7d32' : '',
    color: !isCurrentMonth
      ? 'rgba(0, 0, 0, 0.38)'
      : isSelected
        ? 'white'
        : isOffDay
          ? 'rgba(0, 0, 0, 0.38)'
          : 'inherit',
    background: isSelected
      ? '#2e7d32'
      : isOffDay
        ? 'rgba(0, 0, 0, 0.12)'
        : isToday
          ? 'rgba(76, 175, 80, 0.1)'
          : 'transparent',
    '&:hover': {
      background: isSelected ? '#2e7d32' : isOffDay ? 'rgba(0, 0, 0, 0.12)' : 'rgba(76, 175, 80, 0.1)',
      cursor: isOffDay ? 'not-allowed' : 'pointer',
    },
    transition: 'all 0.2s ease',
  })
);

const TimeButton = styled(Paper, {
  shouldForwardProp: (prop) => prop !== 'isDisabled' && prop !== 'isSelected'
})<{ isDisabled?: boolean; isSelected?: boolean }>(
  ({ theme, isDisabled, isSelected }) => ({
    padding: theme.spacing(1.2),
    textAlign: 'center',
    cursor: isDisabled ? 'not-allowed' : 'pointer',
    borderRadius: '8px',
    transition: 'all 0.2s ease',
    background: isSelected
      ? 'rgba(76, 175, 80, 0.25)'
      : 'rgba(255, 255, 255, 0.9)',
    border: isSelected
      ? '1px solid rgba(76, 175, 80, 0.6)'
      : '1px solid rgba(76, 175, 80, 0.2)',
    color: isSelected ? '#2e7d32' : 'inherit',
    opacity: isDisabled ? 0.5 : 1,
    width: '100%',
    '&:hover': {
      background: isSelected
        ? 'rgba(76, 175, 80, 0.25)'
        : isDisabled
          ? 'rgba(255, 255, 255, 0.9)'
          : 'rgba(76, 175, 80, 0.05)',
      transform: isDisabled ? 'none' : 'translateY(-1px)',
      boxShadow: isDisabled ? 'none' : '0 2px 4px rgba(0, 0, 0, 0.05)',
    },
    boxShadow: isSelected ? '0 2px 8px rgba(76, 175, 80, 0.2)' : 'none'
  })
)





// Function to generate calendar data

// Updated generateCalendarData function
const generateCalendarData = (currentDate: dayjs.Dayjs, availableDates: any[]) => {
  const startOfMonth = currentDate.startOf('month');
  const endOfMonth = currentDate.endOf('month');

  // Get the first day of the month (0-6 where 0 is Sunday)
  const firstDayOfMonth = (startOfMonth.day() + 6) % 7;

  // Create a map of available dates for quick lookup
  const availabilityMap = new Map();
  availableDates.forEach(dateObj => {
    const dateStr = dayjs(dateObj.Date).format('YYYY-MM-DD');
    availabilityMap.set(dateStr, dateObj.IsCarerAvailable);
  });

  // Generate days for the current month only
  const daysInMonth = currentDate.daysInMonth();
  const days = Array(daysInMonth).fill(null).map((_, index) => {
    const date = startOfMonth.add(index, 'day');
    const dateStr = date.format('YYYY-MM-DD');

    // Check if date is within booking window (8-35 days from today)
    const bookingStartDate = dayjs().add(8, 'day').startOf('day');
    const bookingEndDate = bookingStartDate.add(27, 'day').endOf('day');
    const isInBookingWindow =
      (date.isAfter(bookingStartDate) || date.isSame(bookingStartDate, 'day')) &&
      (date.isBefore(bookingEndDate) || date.isSame(bookingEndDate, 'day'));

    // Check availability from the API data
    const isAvailable = availabilityMap.get(dateStr) ?? false;

    return {
      date,
      dayOfMonth: date.date(),
      isCurrentMonth: true, // All dates are in current month now
      isToday: date.isSame(dayjs(), 'day'),
      isSelectable: isInBookingWindow && isAvailable,
      isAvailable: isAvailable
    };
  });

  // Add empty slots for days before the first day of the month
  const emptyStartDays = Array(firstDayOfMonth).fill(null);

  // Calculate total cells needed (6 rows * 7 days = 42 cells)
  const totalCells = 42;
  const remainingEmptyDays = totalCells - emptyStartDays.length - days.length;

  // Group into weeks (6 weeks of 7 days each)
  const allDays = [...emptyStartDays, ...days, ...Array(remainingEmptyDays).fill(null)];
  const weeks = Array(6).fill(null).map((_, i) => allDays.slice(i * 7, (i + 1) * 7));

  return weeks;
};

export const formatToAMPM = (timeStr: string): string => {
  const [hoursStr, minutesStr] = timeStr.split(':');
  const hours = parseInt(hoursStr, 10);
  const minutes = parseInt(minutesStr, 10);

  const period = hours >= 12 ? 'PM' : 'AM';
  const formattedHours = hours % 12 === 0 ? 12 : hours % 12;

  return `${formattedHours}:${minutes.toString().padStart(2, '0')} ${period}`;
};



const TimeslotSelection = () => {
  const router = useRouter();
  const [currentMonth, setCurrentMonth] = useState(dayjs().add(8, 'day'));
  const [selectedDate, setSelectedDate] = useState(dayjs().add(8, 'day'));


  const [availableTimes, setAvailableTimes] = useState<any[]>([]);
  const [availableDates, setAvailableDates] = useState<any[]>([]);

  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [calendarWeeks, setCalendarWeeks] = useState(generateCalendarData(currentMonth, availableDates));
  const [currentTime, setCurrentTime] = useState(`${Intl.DateTimeFormat().resolvedOptions().timeZone} ${dayjs().format('h:mm:ss A')}`);
  const [yearMenuAnchor, setYearMenuAnchor] = useState<null | HTMLElement>(null);
  const [monthMenuAnchor, setMonthMenuAnchor] = useState<null | HTMLElement>(null);

  const { bookingData, updateBookingData, clearBookingData } = useBookingContext();
  const {  clearAllBookings } = useMultiBookingContext()

  const [loading, setLoading] = useState(false);


  // Initialize currentMonth based on edit mode or default to 8 days from now
  const initialDate = bookingData.isEditMode && bookingData.selectedDate
    ? dayjs(bookingData.selectedDate)
    : dayjs().add(8, 'day');



  const activeStep = 1; // Second step (Time)

  // Initialize service state from context
  const [service, setService] = useState({
    name: bookingData.selectedServiceName,
    duration: bookingData.selectedDuration,
    description: bookingData.selectedServiceDescription
  });


  const [firstLoad, setFirstLoad] = useState(true)


  // Fetch timeslots function
  const fetchTimeslots = async (date: dayjs.Dayjs) => {
    try {
      if (firstLoad) {
        setLoading(true)
      }
      
      if (bookingData.selectedServiceId && bookingData.selectedDuration) {
        const serviceID = parseInt(bookingData.selectedServiceId);
        const serviceDurationID = parseInt(bookingData.selectedDurationId);
        const bookingDate = date.format('YYYY-MM-DD');
        const bookingID = bookingData.isEditMode ? bookingData.selectedBookingID : null



        const timeslots = await getTimeslotsApiCall(serviceID, serviceDurationID, bookingDate, bookingID);
        const availableDates = await getAvailableDates(serviceID, bookingID);



        if (Array.isArray(availableDates)) {
          setAvailableDates(availableDates);
        }

        if (Array.isArray(timeslots)) {
          setAvailableTimes(timeslots);
        }
      }
      if (firstLoad) {
        setFirstLoad(false)
      }
    } catch (error) {
      console.error("Error fetching timeslots:", error);
    }
    finally {
      setLoading(false); // Reset loading state
    }
  };


  // Load saved date and time from context if available
  useEffect(() => {
    const savedDate = bookingData.selectedDate;
    const savedTime = bookingData.selectedTime;

    if (savedDate) {
      const date = dayjs(savedDate);
      setSelectedDate(date);

      // If in edit mode, also set the current month to the booking date's month
      if (bookingData.isEditMode) {
        setCurrentMonth(date);
      }
    }

    if (savedTime) {
      setSelectedTime(savedTime);
    }

    // Update service information if it changes in context
    setService({
      name: bookingData.selectedServiceName,
      duration: bookingData.selectedDuration,
      description: bookingData.selectedServiceDescription
    });
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
    setCalendarWeeks(generateCalendarData(currentMonth, availableDates));
  }, [currentMonth, availableDates]);

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(`${Intl.DateTimeFormat().resolvedOptions().timeZone} ${dayjs().format('h:mm:ss A')}`);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handlePrevMonth = () => {
    setCurrentMonth(prev => prev.subtract(1, 'month'));
  };

  const handleNextMonth = () => {
    setCurrentMonth(prev => prev.add(1, 'month'));
  };

  const handleDateSelect = (date: dayjs.Dayjs) => {
    const bookingStartDate = dayjs().add(8, 'day').startOf('day');
    const bookingEndDate = bookingStartDate.add(27, 'day').endOf('day'); // total 28 days

    if (date.isAfter(bookingStartDate.subtract(1, 'day')) && date.isBefore(bookingEndDate.add(1, 'day'))) {
      setSelectedDate(date);
      fetchTimeslots(date); // Fetch new timeslots
    }
  };


  const handleTimeSlotSelect = (date: dayjs.Dayjs, time: string) => {
    setSelectedDate(date);
    setSelectedTime(time);

    // Store in context for use in the next steps
    updateBookingData({
      selectedDate: date.format('YYYY-MM-DD'),
      selectedTime: time
    });

    router.push('/client/booking/provider');
  };


  const handleYearMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setYearMenuAnchor(event.currentTarget);
  };

  const handleYearMenuClose = () => {
    setYearMenuAnchor(null);
  };

  const handleMonthMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMonthMenuAnchor(event.currentTarget);
  };

  const handleMonthMenuClose = () => {
    setMonthMenuAnchor(null);
  };

  const handleYearSelect = (year: number) => {
    setCurrentMonth(prev => prev.year(year));
    handleYearMenuClose();
  };

  const handleMonthSelect = (month: number) => {
    setCurrentMonth(prev => prev.month(month));
    handleMonthMenuClose();
  };

  // Generate years (current year - 1 to current year + 10)
  const years = Array.from({ length: 12 }, (_, i) => dayjs().year() - 1 + i);
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const handleBackToDashboard = () => {
    clearBookingData();
    clearAllBookings()
    router.push('/client/dashboard');
  };


  useEffect(() => {
    if (bookingData.selectedDate) {
      fetchTimeslots(dayjs(bookingData.selectedDate));
    } else {
      // Only default to 8 days ahead if not in edit mode
      fetchTimeslots(bookingData.isEditMode ? dayjs(bookingData.selectedDate) : dayjs().add(8, 'day'));
    }
  }, []);







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



      {!loading && (
        <>
          <AnimatedBox delay={0.2}>
            <Box
              sx={{
                mb: 4,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: { xs: 'flex-start', md: 'center' },
                flexDirection: { xs: 'column', sm: 'row' }, // Flex column on small screens
                gap: 2 // Optional: add spacing between stacked items on small screens
              }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <IconWrapper sx={{ mr: 2, fontSize: 24 }}>
                  <i className="ri-time-line" />
                </IconWrapper>
                <Box>
                  <Typography variant="h4" style={{ marginBottom: 0 }} fontWeight={600} gutterBottom>
                    Select a <HighlightText>Time</HighlightText>
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Choose a date and time for your service
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', alignSelf: 'end' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    {currentTime}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignSelf: 'end' }}>
                  <Button
                    variant="text"
                    color="primary"
                    size="small"
                    startIcon={<i className="ri-arrow-left-line" />}
                    onClick={() => router.push('/client/booking/service')}
                  >
                    Back
                  </Button>
                </Box>
              </Box>
            </Box>
          </AnimatedBox>

          <Grid container spacing={4}>


            {/* Left side - Calendar */}
            <Grid item xs={12} md={5}>
              <AnimatedBox delay={0.3}>
                <CalendarWrapper>
                  {/* Month navigation */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box onClick={handleMonthMenuOpen} sx={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                        <Typography variant="h6" fontWeight={600}>
                          {currentMonth.format('MMMM')}
                        </Typography>
                        <IconButton size="small">
                          <i className="ri-arrow-down-s-line" />
                        </IconButton>
                      </Box>
                      <Box onClick={handleYearMenuOpen} sx={{ cursor: 'pointer', display: 'flex', alignItems: 'center', ml: 1 }}>
                        <Typography variant="h6" fontWeight={600}>
                          {currentMonth.format('YYYY')}
                        </Typography>
                        <IconButton size="small">
                          <i className="ri-arrow-down-s-line" />
                        </IconButton>
                      </Box>

                      {/* Year Selection Menu */}
                      <Menu
                        anchorEl={yearMenuAnchor}
                        open={Boolean(yearMenuAnchor)}
                        onClose={handleYearMenuClose}
                      >
                        {years.map(year => (
                          <MenuItem
                            key={year}
                            onClick={() => handleYearSelect(year)}
                            sx={{
                              fontWeight: currentMonth.year() === year ? 700 : 400,
                              bgcolor: currentMonth.year() === year ? 'rgba(76, 175, 80, 0.1)' : 'transparent'
                            }}
                          >
                            {year}
                          </MenuItem>
                        ))}
                      </Menu>

                      {/* Month Selection Menu */}
                      <Menu
                        anchorEl={monthMenuAnchor}
                        open={Boolean(monthMenuAnchor)}
                        onClose={handleMonthMenuClose}
                      >
                        {months.map((month, index) => (
                          <MenuItem
                            key={month}
                            onClick={() => handleMonthSelect(index)}
                            sx={{
                              fontWeight: currentMonth.month() === index ? 700 : 400,
                              bgcolor: currentMonth.month() === index ? 'rgba(76, 175, 80, 0.1)' : 'transparent'
                            }}
                          >
                            {month}
                          </MenuItem>
                        ))}
                      </Menu>
                    </Box>
                    <Box>
                      <IconButton onClick={handlePrevMonth}>
                        <i className="ri-arrow-left-s-line" />
                      </IconButton>
                      <IconButton onClick={handleNextMonth}>
                        <i className="ri-arrow-right-s-line" />
                      </IconButton>
                    </Box>
                  </Box>

                  {/* Day headers */}
                  <Grid container spacing={0} sx={{ mb: 1 }}>
                    {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
                      <Grid item xs={12 / 7} key={i} sx={{ textAlign: 'center' }}>
                        <Typography variant="body2" fontWeight={500} color="text.secondary">
                          {day}
                        </Typography>
                      </Grid>
                    ))}
                  </Grid>

                  {/* Calendar grid */}
                  {calendarWeeks.map((week, weekIndex) => (
                    <Grid container spacing={0} key={weekIndex}>
                      {week.map((day, dayIndex) => {
                        if (!day) {
                          return (
                            <Grid item xs={12 / 7} key={dayIndex} sx={{ textAlign: 'center', py: 0.5 }}>
                              <Box sx={{ width: '36px', height: '36px' }} />
                            </Grid>
                          );
                        }

                        const isAvailable = availableDates.some(
                          dateObj => dayjs(dateObj.Date).isSame(day.date, 'day') && dateObj.IsCarerAvailable
                        );
                        const isSelectable = day.isSelectable && isAvailable;

                        return (
                          <Grid item xs={12 / 7} key={dayIndex} sx={{ textAlign: 'center', py: 0.5 }}>
                            <DayCell
                              isSelected={day.date.isSame(selectedDate, 'day')}
                              isToday={day.isToday}
                              isCurrentMonth={day.isCurrentMonth}
                              isOffDay={!isSelectable}
                              onClick={() => isSelectable && handleDateSelect(day.date)}
                              sx={{
                                margin: '0 auto',
                                opacity: !isSelectable ? 0.3 : 1,
                                cursor: isSelectable ? 'pointer' : 'not-allowed',
                                position: 'relative'
                              }}
                            >
                              {day.dayOfMonth}
                              {day.isSelectable && !isAvailable && (
                                <Box
                                  component="span"
                                  sx={{
                                    position: 'absolute',
                                    top: '50%',
                                    left: '50%',
                                    width: '24px',
                                    height: '1px',
                                    bgcolor: 'error.main',
                                    transform: 'translate(-50%, -50%) rotate(-45deg)'
                                  }}
                                />
                              )}
                            </DayCell>
                          </Grid>
                        );
                      })}
                    </Grid>
                  ))}
                </CalendarWrapper>

                {/* Service info */}
                <ServiceCard className='mt-4'>
                  <Typography variant="h6" fontWeight={600}>
                    {service.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {service.duration} Hours
                  </Typography>
                  <Typography variant="body2" color="text.primary" sx={{ mt: 1, textAlign: 'justify' }}>
                    {service.description}
                  </Typography>
                </ServiceCard>
              </AnimatedBox>
            </Grid>

            {/* Right side - Time slots */}
            <Grid item xs={12} md={7}>
              <AnimatedBox delay={0.4}>
                <GlassPaper>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="h6" fontWeight={600}>
                      Available start times
                    </Typography>
                  </Box>

                  <Grid container spacing={1.5}>
                    {availableTimes.map((time, index) => {
                      const { IsCarerAvailable, TimeSlot } = time

                      return (
                        <Grid item xs={6} sm={4} key={index} sx={{ mb: 1.5 }}>
                          <TimeButton
                            isDisabled={!IsCarerAvailable}
                            isSelected={selectedTime?.split('T')[1] === TimeSlot?.split('T')[1]}
                            onClick={() => IsCarerAvailable && handleTimeSlotSelect(selectedDate, TimeSlot)}
                          >
                            <Typography
                              variant="body2"
                              fontWeight={selectedTime?.split('T')[1] === TimeSlot?.split('T')[1] ? 700 : 500}
                              color={!IsCarerAvailable ? 'text.disabled' : (selectedTime?.split('T')[1] === TimeSlot?.split('T')[1] ? 'primary.dark' : 'inherit')}
                            >
                              {dayjs(TimeSlot).utc().format('hh:mm A')}
                            </Typography>
                          </TimeButton>
                        </Grid>
                      );
                    })}

                  </Grid>
                </GlassPaper>
              </AnimatedBox>
            </Grid>
          </Grid>


        </>

      )}
    </Container>
  );
};

export default TimeslotSelection;

