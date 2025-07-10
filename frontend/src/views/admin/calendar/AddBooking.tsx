import React, { useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
  Divider,
  Grid,
  TextField,
  MenuItem,
} from '@mui/material';
import { LocalizationProvider, DatePicker, TimePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import { useForm, Controller } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { getBookingbyIDApiCall } from '../bookingRequests/action';
import { useEffect } from 'react';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { toast } from 'react-toastify';


import { confirmBookingApiCall, getClientServicesApiCall } from '@/app/(dashboard)/(private)/client/booking/actions';
import { getTimeslotsApiCall } from '@/app/(dashboard)/(private)/client/booking/actions';
import { getClientCarerApiCall } from '@/app/(dashboard)/(private)/client/booking/actions';
import { updateBookingApiCall, } from '@/app/(dashboard)/(private)/client/booking/actions';


import { getClientListApiCall } from './action'
import { formatTimeTo } from '@/utils/commonFunction';


function convertStartTime(utcTimeString: string): string {
  // Create a Date object from the UTC time string
  const utcDate = new Date(`1970-01-01T${utcTimeString}`);

  // Add 5 hours and 30 minutes to convert to IST
  const istHours = utcDate.getUTCHours() + 5;
  const istMinutes = utcDate.getUTCMinutes() + 30;

  // Create a new Date object to handle overflow (e.g., minutes > 59 or hours > 23)
  const istDate = new Date(1970, 0, 1, istHours, istMinutes);

  // Extract hours and minutes
  let hours = istDate.getHours();
  const minutes = istDate.getMinutes();

  // Determine AM/PM
  const ampm = hours >= 12 ? 'PM' : 'AM';

  // Convert to 12-hour format
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'

  // Format minutes with leading zero if needed
  const formattedMinutes = minutes < 10 ? '0' + minutes : minutes.toString();

  // Combine and return the formatted time
  return `${hours}:${formattedMinutes} ${ampm}`;
}




const shouldDisableDate = (date: Dayjs) => {
  const today = dayjs().startOf('day');
  const startSelectableDate = today.add(8, 'day');
  const endSelectableDate = startSelectableDate.add(28, 'day');

  return date.isBefore(today) ||
    (date.isAfter(today) && date.isBefore(startSelectableDate)) ||
    date.isAfter(endSelectableDate);
};





interface EditBookingProps {
  title: string;
  open: boolean;
  handleClose: () => void;
  onConfirm: (data: FormData) => void;
  bookingData: any; // Replace `any` with a proper type if available (e.g., `BookingType`)
  fetchBooking?: () => void; // Optional if not always passed
}


interface FormData {
  bookingDate: any;
  startTime: any;
  service: string;
  duration: string;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  clientTime: string;
  carer: string;
  description: string;
}






const AddBookingDialog: React.FC<EditBookingProps> = ({
  title,
  open,
  handleClose,
  onConfirm,
  bookingData,
  fetchBooking
}) => {



  dayjs.extend(utc);
  dayjs.extend(timezone);


  const [dateError, setDateError] = useState<string | null>(null);
  const [initData, setInitData] = useState(null)





  const schema = yup.object().shape({
    service: yup.string().optional(),
    duration: yup.string().optional(),
    bookingDate: yup.date().nullable().optional(),
    startTime: yup.date().nullable().optional(),
    carer: yup.string().optional(),
    clientName: yup.string().optional(),
    description: yup.string().optional()
  });

  const defaultValues = {

    clientName: initData?.ClientName,
    clientPhone: initData?.ClientPhoneNo,
    clientEmail: initData?.ClientEmailID,
    clientTime: `${formatTimeTo(initData?.BookingDateTime?.split('T')[1])} to ${formatTimeTo(initData?.EndTime?.split('T')[1])}`,
  };

  type FormValidate = yup.InferType<typeof schema>

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<FormValidate>({
    resolver: yupResolver(schema),
    defaultValues
  });

  const handleDialogClose = () => {
    reset();

    setSelectedTime(dayjs().set('hour', 8).set('minute', 0).set('second', 0))

    setDateError(null);
    setTimeError(null)

    handleClose();
    setSelectedService(null)
    setSelectedDuration(null)
    setSelectedClient('')
    setSelectedDescrr('')


  };






  useEffect(() => {

    if (open && bookingData?.BookingID) {
      const fetchBookingData = async () => {
        try {
          const res = await getBookingbyIDApiCall(bookingData?.BookingID);
          setInitData(res[0])
        } catch (error) {
          console.error('Error fetching booking data:', error);
        }
      };

      fetchBookingData();
    }
  }, [open, bookingData]);





  const [services, setServices] = useState([])
  const [selectedService, setSelectedService] = useState<number>(null);

  const [durations, setDurations] = useState([])
  const [selectedDuration, setSelectedDuration] = useState<number>(null);

  const [bookingDate, setBookingDate] = useState<Dayjs | string | null>(null);
  const [bookingTime, setBookingTime] = useState('')

  const [availableTimes, setAvailableTimes] = useState([])
  const [selectedTime, setSelectedTime] = useState(dayjs().set('hour', 8).set('minute', 0).set('second', 0));

  const [carers, setCarers] = useState([])
  const [selectedCarer, setSelectedCarer] = useState('');

  const [selectedDescrr, setSelectedDescrr] = useState('')


  const [client, setClient] = useState([])
  const [selectedClient, setSelectedClient] = useState('')


  const [isDurationDisabled, setIsDurationDisabled] = useState(true);
  const [isTimeDisabled, setIsTimeDisabled] = useState(true);
  const [isClientDisabled, setIsClientDisabled] = useState(true);



  const fetchClient = async () => {
    try {
      const client = await getClientListApiCall()
      setClient(client as any[])
    }
    catch (err) {

    }
  }

  useEffect(() => {
    fetchClient()
  }, [])


  // prefilling Data


  useEffect(() => {          // For edit booking
    if (initData) {
      setSelectedService(initData.ServiceID)
      setSelectedDuration(initData.Duration)

      setBookingDate(dayjs(initData.BookingDateTime).format('YYYY-MM-DD'))
      setSelectedTime(dayjs().set('hour', 8).set('minute', 0).set('second', 0))

      setSelectedCarer(initData.CarerID)
      setSelectedDescrr(initData.Descr)
    }
  }, [initData])




  useEffect(() => {
    const fetchData = async () => {
      const data = await getClientServicesApiCall();
      if (data) {
        setServices(data as any[]);
      }
    };
    fetchData();
  }, [open]);


  useEffect(() => {
    const selectedServiceObj = services.filter(service => service.ServiceID === selectedService);
    setDurations(selectedServiceObj[0]?.Durations);
    setIsDurationDisabled(!selectedService);
    // If service is unselected, disable downstream fields
    if (!selectedService) {
      setIsTimeDisabled(true);
      setIsClientDisabled(true);
    }
  }, [selectedService]);




  useEffect(() => {
    const fetchTimeslots = async () => {
      try {


        const service = services.filter((service) => (service.ServiceID == selectedService))
        const duration = service && service[0]?.Durations.filter((duration) => (duration.Duration == selectedDuration))


        const timeslots = await getTimeslotsApiCall(selectedService, duration[0].ServiceDurationID, bookingData.isNewBooking ? dayjs.utc(bookingData.BookingDateTime).format('YYYY-MM-DD') : bookingDate, bookingData.BookingID ?? null);

        if (Array.isArray(timeslots)) {
          setAvailableTimes(timeslots);
        }

      } catch (error) {
        // console.error("Error fetching timeslots:", error);
      }
    };

    // if (bookingDate) {
    fetchTimeslots()

    // }
  }, [bookingDate, selectedDuration, selectedService])






  useEffect(() => {
    const fetchCarers = async () => {
      try {


        const dateStr1 = bookingDate
        const dateStr2 = selectedTime

        const datePart = dayjs(dateStr1).format("YYYY-MM-DD");
        const timePart = dayjs(dateStr2).format("HH:mm:ss");

        const combinedDateTime = dayjs(`${datePart}T${timePart}`).format("YYYY-MM-DD HH:mm:ss");    // Need to fix




        if (!bookingData.isNewBooking) {
          const carers = await getClientCarerApiCall(selectedService, selectedDuration, combinedDateTime, bookingData.BookingID);

          if (Array.isArray(carers)) {
            setCarers(carers);
          }

        }



      } catch (error) {
        console.error("Error fetching timeslots:", error);
      }
    };

    if (selectedTime) {
      fetchCarers()
    }

  }, [selectedTime, bookingDate])




  // Custom function to disable unavailable times
  const [timeError, setTimeError] = useState<string | null>(null);


  const shouldDisableTime = (timeValue) => {
    if (!availableTimes || availableTimes.length === 0) {
      // setTimeError('No time slots available for selected date');
      return true;
    }


    const timeString = dayjs(timeValue).format('HH:mm:ss');



    const timeSlot = availableTimes.find(t => dayjs(t.TimeSlot).utc().format('HH:mm:ss') === timeString);


    if (!timeSlot || !timeSlot.IsCarerAvailable) {
      setTimeError('Please select an available time slot');
      return true;
    }



    setTimeError(null);
    return false;
  };

  const isTimeSlotDisabled = !availableTimes?.some(
    (slot) => slot.IsCarerAvailable === true
  );



  useEffect(() => {
    if (bookingData.isNewBooking) {
      setIsClientDisabled(!selectedTime);
    }
  }, [selectedTime, bookingData.isNewBooking]);


  const handleAddConfirm = async () => {
    try {
      const dateStr1 = dayjs(bookingData?.BookingDateTime).format('YYYY-MM-DD');
      const dateStr2 = selectedTime;

      const datePart = dayjs(dateStr1).format("YYYY-MM-DD");
      const timePart = dayjs(dateStr2).format("HH:mm:ss");

      const combinedDateTime = `${datePart}T${timePart}.000Z`;

      const bookingDataToPost = [
        {
          bookingDateTime: combinedDateTime,
          clientID: selectedClient,
          serviceID: selectedService,
          carerID: bookingData.CarerID,
          duration: selectedDuration,
          descr: selectedDescrr, // Already fixed typo
          selectedBookingID: null,
          isRecurring: false
        }
      ];

      const result = await confirmBookingApiCall(bookingDataToPost);

      if (result) {
        fetchBooking();
        toast.success('Booking created successfully');
      }
    } catch (err) {
      console.error("Error creating booking:", err);
      toast.error('Failed to create booking');
    } finally {
      handleDialogClose();
    }
  };






  const isDuration = durations?.some(item => item.Duration == selectedDuration);




  const onSubmit = (data: FormData) => {
    handleAddConfirm();
  };

  return (

    <form id="booking-form" onSubmit={handleSubmit(onSubmit)}>
      <Dialog
        fullWidth
        open={open}
        onClose={handleDialogClose}
        maxWidth='md'
        scroll='paper'
        closeAfterTransition={false}
        PaperProps={{
          sx: {
            borderRadius: '12px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)'
          }
        }}
      >
        <DialogTitle
          sx={{
            px: 4,
            py: 3,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <Typography variant='h5' sx={{ fontWeight: 600 }}>
            <span>  Add New Booking With <span style={{ color: bookingData.CarerColor, fontWeight: '700' }} > {bookingData.CarerName}  </span> </span>
          </Typography>
          <IconButton
            onClick={handleDialogClose}>
            <i className="ri-close-line text-2xl" />
          </IconButton>
        </DialogTitle>

        <Divider />

        <DialogContent sx={{ px: 4, py: 3 }}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>



            <Grid container spacing={6}>



              <Grid item xs={12} sm={6}>
                <Controller
                  name="service"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      select
                      fullWidth
                      label="Service"
                      value={selectedService}
                      onChange={(e) => {
                        field.onChange(e);
                        setSelectedService(e.target.value as any);
                      }}
                    >
                      {services.map((service) => (
                        <MenuItem key={service.ServiceID} value={service.ServiceID}>
                          {service.ServiceName}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name='duration'
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      select
                      fullWidth
                      label="Duration"
                      disabled={isDurationDisabled}
                      value={selectedDuration}
                      onChange={(e) => {
                        field.onChange(e);
                        setSelectedDuration(e.target.value as any);
                        setSelectedTime(dayjs().set('hour', 8).set('minute', 0).set('second', 0));
                        // Enable time field when duration is selected
                        setIsTimeDisabled(!e.target.value);
                        // If duration is unselected, disable client field
                        if (!e.target.value) {
                          setIsClientDisabled(true);
                        }
                      }}
                    >
                      {durations?.map((duration) => (
                        <MenuItem key={duration.ServiceDurationID} value={duration.Duration}>
                          {duration.Duration} Hours
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              </Grid>


              <Grid item xs={12} sm={6}>
                <Controller
                  name='bookingDate'
                  control={control}
                  render={({ field }) => (
                    <DatePicker
                      label="Booking Date"
                      onChange={(newValue) => {
                        field.onChange(newValue);
                        setBookingDate(dayjs(bookingData.BookingDateTime))
                      }}
                      disabled={true}
                      value={dayjs(bookingData.BookingDateTime)}
                      format="DD/MM/YYYY"
                      shouldDisableDate={shouldDisableDate}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          error: false
                          // // // error: !!errors.bookingDate || !!dateError,
                          // // helperText: (errors.bookingDate?.message as string) || dateError
                        }
                      }}
                    />
                  )}
                />
              </Grid>


              <Grid item xs={12} sm={6}>
                <Controller
                  name='startTime'
                  control={control}
                  render={({ field }) => (
                    <TimePicker
                      label="Start Time"
                      disabled={isTimeDisabled || isTimeSlotDisabled}
                      timeSteps={{ minutes: 15 }}


                      onChange={(newValue) => {
                        if (isTimeSlotDisabled) {
                          field.onChange(null);
                          setSelectedTime(null);
                          return;
                        }
                        field.onChange(newValue);
                        setSelectedTime(dayjs(newValue));
                      }}



                      value={dayjs(selectedTime)}
                      ampm
                      shouldDisableTime={shouldDisableTime}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          error: !!timeError,
                          helperText: timeError || ''
                        }
                      }}
                    />
                  )
                  }
                />
              </Grid>


              <Grid item xs={bookingData.isNewBooking ? 6 : 12}>
                <Controller
                  name='carer'
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Carer"
                      defaultValue={bookingData.CarerName}
                      disabled={true}
                    >
                    </TextField>
                  )}
                />
              </Grid>


              <Grid item xs={6}>
                <Controller
                  name='clientName'
                  disabled={isClientDisabled}
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      select
                      fullWidth
                      label="Client"
                      onChange={(e) => {
                        field.onChange(e);
                        setSelectedClient(e.target.value);
                      }}
                      value={selectedClient}
                    >
                      {client.map((client) => (
                        <MenuItem key={client.ClientID} value={client.ClientID}>
                          {client.ClientName}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              </Grid>



              <Grid item xs={12}>
                <Controller
                  name='description'
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      multiline
                      rows={4}
                      value={selectedDescrr}
                      onChange={(e) => {
                        field.onChange(e);
                        setSelectedDescrr(e.target.value)
                      }}
                      label="Description"
                    />
                  )}
                />
              </Grid>



            </Grid>



          </LocalizationProvider>
        </DialogContent>

        <Divider />

        <DialogActions
          sx={{
            justifyContent: 'space-between',
            px: 4,
            py: 3,
          }}
        >
          <Button
            variant='contained'
            type="submit"
            form="booking-form"
            onClick={handleAddConfirm}
            disabled={isTimeSlotDisabled || !isDuration || !!timeError || !selectedTime || !selectedClient}
          >
            Save
          </Button>
          <Button
            variant='outlined'
            color='error'
            onClick={handleDialogClose}
          >
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </form>
  );
};

export default AddBookingDialog;


