'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  styled,
  Button,
  Paper,
  BoxProps,
  Icon,
  Backdrop,
  TextField,
  Modal,
  Fade,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs, { Dayjs } from 'dayjs';

import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers';
import 'dayjs/locale/en-gb';

import { getMyBookingsApiCall, getBookingbyIDApiCall } from '../booking/actions';

import { useAppSelector } from '@/redux/useAppSelector'
import { useBookingContext } from '@/contexts/bookingContexts/BookingContext';;

import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

import { toast } from 'react-toastify';
import { formatTimeTo, GetFormattedDate } from '@/utils/commonFunction';
import { updateBookingStatusApiCall } from '@/views/admin/bookingRequests/action';
import { useSelector } from 'react-redux';


// ...rest of imports and styles (unchanged)


interface AnimatedBoxProps extends BoxProps {
  delay?: number;
}



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
}));




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





const HighlightText = styled('span')(({ theme }) => ({
  background: 'linear-gradient(90deg, #4caf50 0%, #2e7d32 100%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
  textFillColor: 'transparent',
}))


const CalendarDate = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  borderRadius: theme.spacing(1),
  padding: theme.spacing(1),
  textAlign: 'center',
  width: 60,
  fontWeight: 600,
}));

const AnimatedBox = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'delay'
})<{ delay: number }>( // removed optional '?'
  ({ theme, delay }) => ({
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
);


const CarerCard = styled(GlassPaper)(({ theme }) => ({
  padding: theme.spacing(3),
  height: '400px',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  gap: theme.spacing(1),
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  borderRadius: '12px',
  border: '1px solid rgba(0, 0, 0, 0.12)',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 6px 16px rgba(0, 0, 0, 0.1)',
  },
}));

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



//////////////////////////////////////////////  GOOGLE CALENDAR INTEGRATION HELPER FUNCTIONS /////////////////////////////////////////////////////////


function yyyymmdd(dateValue: any) {
  var result = dateValue.getFullYear();
  var mm = dateValue.getMonth() < 9 ? "0" + (dateValue.getMonth() + 1) : (dateValue.getMonth() + 1); // getMonth() is zero-based
  var dd = dateValue.getDate() < 10 ? "0" + dateValue.getDate() : dateValue.getDate();
  return "".concat(result).concat(mm).concat(dd);
};

function yyyymmddhhmm(dateValue: any) {
  var result = yyyymmdd(dateValue);
  var hh = dateValue.getHours() < 10 ? "0" + dateValue.getHours() : dateValue.getHours();
  var min = dateValue.getMinutes() < 10 ? "0" + dateValue.getMinutes() : dateValue.getMinutes();
  return "".concat(result).concat("T").concat(hh).concat(min);
};


function yyyymmddhhmmss(dateValue: any) {
  var result = yyyymmddhhmm(dateValue);
  var ss = dateValue.getSeconds() < 10 ? "0" + dateValue.getSeconds() : dateValue.getSeconds();
  return "".concat(result).concat(ss).concat("a");
};

function GenerateNewCalendarEvent(EventDateTime, Title, Description, GuestEmails) {
  var Command = "https://calendar.google.com/calendar/r/eventedit?action=TEMPLATE";
  if (Title) {
    Command += `&text=${Title}`;
  }
  if (EventDateTime) {

    var dates = yyyymmddhhmmss(new Date(EventDateTime));
    var seconddate = yyyymmddhhmmss(new Date(new Date(EventDateTime).setHours(new Date(EventDateTime).getHours() + 1)));
    dates += "/" + seconddate;
    Command += `&dates=${dates}`;
  }

  Command += "&allday=false";

  if (Description) {
    Command += `&details=${Description}`;
  }
  for (var i = 0; i < GuestEmails?.length; i++) {
    if (GuestEmails[i]) {
      Command += `&add=${GuestEmails[i]}`;
    }
  }

  Command += "&crm=AVAILABLE&trp=false";

  window.open(Command, '_blank', 'noopener,noreferrer');
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////






export const formatToAMPM = (timeStr: string, convertToUtc: boolean): string => {
  const [hoursStr, minutesStr] = timeStr.split(':');
  const hours = parseInt(hoursStr, 10);
  const minutes = parseInt(minutesStr, 10);

  // Convert UTC time to IST (+05:30)
  const date = new Date(Date.UTC(1970, 0, 1, hours, minutes)); // Create UTC date

  if (convertToUtc) {
    date.setMinutes(date.getMinutes() + Math.abs(new Date().getTimezoneOffset())); // Add 5 hours 30 minutes (IST offset)
  }

  const hoursInIST = date.getUTCHours(); // Get IST hours
  const minutesInIST = date.getUTCMinutes(); // Get IST minutes

  // Format to AM/PM
  const period = hoursInIST >= 12 ? 'PM' : 'AM';
  const formattedHours = hoursInIST % 12 === 0 ? 12 : hoursInIST % 12;

  return `${formattedHours}:${minutesInIST.toString().padStart(2, '0')} ${period}`;
};




// ===================== COMPONENT =====================


const MyBookings = () => {
  const router = useRouter();

  const [startDate, setStartDate] = useState<Dayjs | null>(null);
  const [endDate, setEndDate] = useState<Dayjs | null>(null);
  const [bookings, setBooking] = useState<any[]>([]); // Store real booking data

  const [modalOpen, setModalOpen] = useState(false);

  const [bookingID, setBookingID] = useState<number | null>(null);

  const [reason, setReason] = useState('')
  const [reasonError, setReasonError] = useState(false)
  const [isFeeApply, setIsFeeApply] = useState(false)

  const [cancelAll, setCancelAll] = useState(false)
  const [reccuringBookingID, setReccuringBookingID] = useState(null)

  dayjs.extend(utc);
  dayjs.extend(timezone);

  const { bookingData, updateBookingData, clearBookingData } = useBookingContext();


  const clientID = useAppSelector((state) => state?.authReducer?.client?.user?.clientID)

  const handleBackToDashboard = () => {
    router.push('/client/dashboard');
  };


  const fetchBookings = async () => {
    try {
      const apiBookings = await getMyBookingsApiCall(clientID);

      setBooking(apiBookings as any); // Update state with fetched data
    } catch (error) {

    }
  };


  // Fetch bookings data from API
  useEffect(() => {
    fetchBookings();
  }, [clientID]);

const isWithinRange = (bookingDateStr: string) => {
  const bookingDate = dayjs(bookingDateStr);

  // ✅ If booking date is invalid OR start/end date is invalid → skip filtering
  if (
    !bookingDate.isValid() ||
    (startDate && !dayjs(startDate).isValid()) ||
    (endDate && !dayjs(endDate).isValid())
  ) {
    return true;
  }

  // ✅ If no filters applied, include all
  if (!startDate && !endDate) return true;

  if (startDate && endDate) {
    return (
      bookingDate.isAfter(dayjs(startDate).startOf('day')) &&
      bookingDate.isBefore(dayjs(endDate).endOf('day'))
    );
  }

  if (startDate) return bookingDate.isAfter(dayjs(startDate).startOf('day'));
  if (endDate) return bookingDate.isBefore(dayjs(endDate).endOf('day'));

  return true;
};


  const filteredBookings = bookings?.filter((b) => isWithinRange(b.BookingDateTime));






  const handleCloseModal = () => {
    setCancelAll(false)
    setModalOpen(false);
    setReason('')
    setReasonError(false)
  };


  const handleEdit = async (bookingID, rowData) => {


    try {

      const result = await getBookingbyIDApiCall(bookingID)

      const bookingData = result[0]





      updateBookingData({
        selectedServiceId: parseInt(bookingData.ServiceID),
        selectedDurationId: '',
        selectedDuration: bookingData.Duration,
        selectedServiceName: rowData?.ServiceName,
        selectedServiceDescription: '',

        selectedDate: bookingData?.BookingDateTime,
        selectedTime: bookingData?.BookingDateTime,

        selectedProviderId: bookingData.CarerID,
        selectedProviderName: rowData.CarerName,
        selectedBookingDescription: bookingData.Descr || '',
        selectedBookingID: bookingData.BookingID,

        frequencyDuration: bookingData.FrequencyDuration,
        frequencyInterval: bookingData.FrequencyInterval,
        frequencyType: bookingData.FrequencyType,
        recurringBookingID: bookingData.RecurringBookingID,

        initialStartDate:bookingData.StartDate,

        isEditMode: true




      });

      router.push('/client/booking/service');

    }

    catch (error) {

    }


  };




  const handleBookMore = () => {
    router.push('/client/booking/service')
  }


  const loggedInUserID = useSelector((state: any) => state.authReducer?.admin?.user?.userID)


  const handleCancelBooking = (bookingID: number, bookingDateTime, reccuringBookingID) => {
    setModalOpen(true)
    setBookingID(bookingID)
    setReccuringBookingID(reccuringBookingID)

    const target = dayjs(bookingDateTime);
    const now = dayjs(); // current time
    const isAfter72Hours = target.isAfter(now.add(72, 'hour'));
    setIsFeeApply(isAfter72Hours)


  }



  const handleCancelBookingConfirm = async () => {
    try {
      const res = await updateBookingStatusApiCall(bookingID, 101, null, loggedInUserID, reason, cancelAll, false)
      if (res?.isOk) {
        toast.success('Booking cancelled successfully')
        handleCloseModal()
        fetchBookings()
      }
    }

    catch (err) {

    }
  }




  const user = useSelector((state: any) => state.authReducer.client.user);


  const handleAddToCalendar = (booking) => {
    // Prepare event details
    const eventTitle = `${booking.ServiceName} with ${booking.CarerName}`;
    const eventDescription = `${booking.ServiceName} for ${booking.Duration} Hours with ${booking.CarerName}`.trim();

    // Convert booking time to UTC
    const bookingDate = new Date(booking.BookingDateTime);
    const timezoneOffset = bookingDate.getTimezoneOffset(); // in minutes
    const utcBookingDate = new Date(bookingDate.getTime() + (timezoneOffset * 60 * 1000));

    // Call the function with UTC time
    GenerateNewCalendarEvent(
      utcBookingDate,           // Event start time in UTC
      eventTitle,               // Event title
      eventDescription,         // Event description
      [user.emailID],           // Guest emails
    );
  };



  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="en-gb">
        {/* Back button */}
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-start' }}>
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




        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: { xs: 'start', md: 'end' },
            flexDirection: { xs: 'column', md: 'row' },
            gap: { xs: 3, sm: 0 },
            mb: 6,
          }}
        >
          {/* Left section */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: { xs: 2, sm: 0 } }}>
            <IconWrapper sx={{ mr: 2, fontSize: 24 }}>
              <i className="ri-calendar-check-line" />
            </IconWrapper>

            <Box>
              <Typography variant="h4" fontWeight={600} gutterBottom sx={{ mb: 0 }}>
                My <HighlightText>Bookings</HighlightText>
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Manage your booked services
              </Typography>
            </Box>
          </Box>

          {/* Date Range Filter */}
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: { xs: 'flex-start', sm: 'center' },
              gap: 2,
              marginTop: { sm: 4, md: 0 },
            }}
          >
            <Button
              onClick={handleBookMore}
              size="small"
              variant="contained"
              sx={{ backgroundColor: '#2e7d32', width: { xs: '100%', sm: 'auto' } }}
              startIcon={<i className="ri-refresh-line" />}
            >
              Book More
            </Button>

            <DatePicker
              label="Start Date"
              value={startDate}
              onChange={(newValue) => setStartDate(newValue)}
              maxDate={endDate || undefined}
              slotProps={{ textField: { size: 'small' } }}
              format="DD/MM/YYYY"
              className="w-[160px]"
            />

            <DatePicker
              label="End Date"
              value={endDate}
              onChange={(newValue) => setEndDate(newValue)}
              minDate={startDate || undefined}
              slotProps={{ textField: { size: 'small' } }}
              format="DD/MM/YYYY"
              className="w-[160px]"
            />

            <Button
              variant="text"
              size="small"
              onClick={() => {
                setStartDate(null);
                setEndDate(null);
              }}
              sx={{ width: { xs: '100%', sm: 'auto' } }}
            >
              Clear
            </Button>
          </Box>
        </Box>






      </LocalizationProvider>


      <Modal
        open={modalOpen}
        onClose={handleCloseModal}
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
        }}
      >
        <Fade in={modalOpen}>
          <ModalContent>
            <>


              <ModalBody>

                <Box sx={{ mb: 3, mx: 2 }}>
                  <Typography variant="h5" className="font-semibold text-red-600 mb-0" fontWeight={500} gutterBottom>
                    Cancel Booking
                  </Typography>

                  <Typography variant="body1" className='mb-3' gutterBottom>
                    Are you sure you want to cancel this booking. This action can not be undone.
                  </Typography>






                  {!isFeeApply &&
                    <Box sx={{ p: 1 }}>
                      <Typography variant="body2" gutterBottom>
                        If you need to cancel a scheduled service, you need to provide AYAS with 72 hours notice prior
                        to the commencement of the scheduled service.
                      </Typography>
                      <Typography variant="body2" gutterBottom>
                        If you cancel after this time, it is my right to charge a cancellation fee. AYAS cancellation fee is:
                      </Typography>
                      <Box component="ul" sx={{ pl: 2, mt: 1 }}>
                        <Box component="li" sx={{ mb: 1 }}>
                          <Typography variant="body2">
                            A maximum of 50% of the hourly agreed upon rate where the scheduled service is
                            charged at for the agreed upon hours.
                          </Typography>
                        </Box>
                        <Box component="li">
                          <Typography variant="body2">
                            Any agreed expenses incurred by me in preparing to provide my services to you e.g.
                            the pre-purchase of tickets for an event.
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  }




                  <TextField
                    className="my-3"
                    onChange={(e) => setReason(e.target.value)}
                    value={reason}
                    fullWidth
                    label="Reason For Cancellation - Not Required"
                    multiline
                    rows={4}
                    variant="outlined"
                  // error={reasonError}
                  // helperText={reasonError ? 'Cancellation reason is required' : ''}
                  />



                  {reccuringBookingID &&
                    <Box sx={{ mt: 2 }}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={cancelAll}
                            onChange={(e) => setCancelAll(e.target.checked)}
                            color="primary"
                          />
                        }
                        label="Do you want to cancel all linked reccuring bookings?"
                      />

                    </Box>
                  }


                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'center', mx: 2, mt: 6, mb: 0 }}>
                  <Button variant='outlined' color='primary' onClick={handleCancelBookingConfirm} sx={{ mx: 4 }}>
                    Confirm
                  </Button>
                  <Button variant='outlined' color='error' onClick={handleCloseModal} sx={{ mx: 4 }}>
                    Close
                  </Button>
                </Box>

              </ModalBody>
            </>
          </ModalContent>
        </Fade>


      </Modal>



      <Grid container spacing={3}>
        {filteredBookings.length > 0 ? (
          filteredBookings.map((booking, index) => {
            var status
            var color
            if (booking.BookingStatus == 0) {
              status = 'Pending'
              color = '#ff9800'
            }
            else if (booking.BookingStatus == 1) {
              status = 'Confirmed'
              color = '#4caf50'
            }
            else {
              status = 'Cancelled'
              color = '#f44336'
            }


            const bDateTimeValue = booking.BookingDateTime.split('T')
            const bStartDateValue = GetFormattedDate(bDateTimeValue[0])
            const bStartTimeValue = formatTimeTo(bDateTimeValue[1])

            const bEndDateTimeValue = booking.EndTime.split('T')
            const bEndTimeValue = formatTimeTo(bEndDateTimeValue[1])




            return (
              <Grid item xs={12} md={6} lg={4} key={booking.BookingID}>
                <AnimatedBox delay={0.4 + index * 0.15}>

                  {booking.RecurringBookingID
                    &&
                    <Box sx={{
                      position: 'absolute',
                      top: -5,
                      left: -5,
                      width: 18,
                      height: 18,
                      borderRadius: '50%',
                      backgroundColor: '#28a745',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      zIndex: 1,
                      boxShadow: 2,
                      p: '1px'

                    }}>
                      <i className="ri-refresh-line"></i>

                    </Box>
                  }


                  <CarerCard>
                    {/* Top Section */}



                    <div>

                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                        <Box sx={{ display: 'flex' }}>
                          <CalendarDate sx={{ mr: 2 }}>
                            <Typography variant="body2" sx={{ fontSize: 12, color: 'white' }}>
                              {dayjs(booking.BookingDateTime).format('MMM')}
                            </Typography>
                            <Typography variant="h6" sx={{ fontSize: 20, color: 'white' }}>
                              {dayjs(booking.BookingDateTime).format('DD')}
                            </Typography>
                          </CalendarDate>

                          <Typography variant="h6" fontWeight={600} sx={{ display: 'flex', flexDirection: 'column' }}>
                            <Typography>{booking.ServiceName} </Typography>
                            <Typography variant="body2" color={color}>
                              {status}
                            </Typography>
                          </Typography>
                        </Box>


                        {
                          (status !== 'Cancelled' && booking.CompletionStatus == 0) &&

                          <Grid item sx={{ display: 'flex', justifyContent: 'end', alignItems: 'start' }}>
                            <Box>
                              <Icon onClick={() => { handleEdit(booking.BookingID, booking) }} className="ri-edit-line" sx={{ color: '#5FB3D3', fontSize: 21, cursor: 'pointer' }} />
                            </Box>
                            {/* <Box>
                              <Icon onClick={() => { handleDelete(booking.BookingID) }} className="ri-delete-bin-line" sx={{ color: 'error.main', fontSize: 21, cursor: 'pointer' }} />
                            </Box> */}
                          </Grid>

                        }

                      </Box>

                      {/* Details */}
                      <Box sx={{ alignSelf: 'stretch', my: 1 }}>
                        {[{ label: 'Date', value: bStartDateValue },


                        { label: 'Start time', value: bStartTimeValue },
                        { label: 'Ends time', value: bEndTimeValue },


                        // { label: 'Start time', value: new Date (booking?.BookingDateTime).toDateString() },
                        // { label: 'Ends time', value: formatToAMPM(booking?.EndTime, false) },



                        { label: 'Carer', value: booking.CarerName },
                        ].map((item) => (
                          <Box key={item.label} sx={{ display: 'flex', justifyContent: 'space-between', my: 1.25 }}>
                            <Typography variant="body1" color="text.secondary" sx={{ minWidth: 100 }}>
                              {item.label}
                            </Typography>
                            <Typography variant="body1" fontWeight={500}>
                              {item.value}
                            </Typography>
                          </Box>
                        ))}

                        <Typography variant="body1" sx={{ mt: 4 }}>
                          Description/Instructions
                        </Typography>
                        <Typography fontWeight={500}>
                          {booking.Descr || 'No description'}
                        </Typography>
                      </Box>
                    </div>

                    {/* Actions */}
                    <Box sx={{ display: 'flex', mt: 2, justifyContent: 'space-between', alignItems: 'flex-end', alignSelf: 'center' }}>
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: { xs: 'center', sm: 'end' },
                          flexDirection: { xs: 'column', sm: 'row' },
                        }}>
                        <Button
                          onClick={() => { handleAddToCalendar(booking) }}
                          size="small" variant="contained" color="primary" sx={{ mx: 2 }} startIcon={<i className="ri-calendar-line" />}>
                          Add To Calendar
                        </Button>

                        {(status !== 'Cancelled' && booking.CompletionStatus == 0 && dayjs(booking.BookingDateTime).isAfter(dayjs()))

                          &&

                          <Button
                            sx={{
                              mx: 2,
                              marginTop: { xs: 2, md: 0 },
                            }}
                            size="small" variant="contained" className='bg-red-500' startIcon={<i className="ri-close-line" />}
                            onClick={() => { handleCancelBooking(booking.BookingID, booking.BookingDateTime, booking.RecurringBookingID) }}
                          >
                            Cancel Booking
                          </Button>
                        }


                      </Box>
                    </Box>
                  </CarerCard>
                </AnimatedBox>

              </Grid>


            )
          })
        ) : (
          <Grid item xs={12}>
            <Typography variant="h6" align="center" sx={{ mt: 24 }}>
              No bookings found
            </Typography>
          </Grid>
        )}
      </Grid>
    </Container>
  );
};

export default MyBookings;


