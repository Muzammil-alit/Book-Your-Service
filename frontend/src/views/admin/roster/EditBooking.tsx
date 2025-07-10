'use client'

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
  Paper,
  Box
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


import { getClientServicesApiCall } from '@/app/(dashboard)/(private)/client/booking/actions';
import { getTimeslotsApiCall } from '@/app/(dashboard)/(private)/client/booking/actions';
import { getClientCarerApiCall } from '@/app/(dashboard)/(private)/client/booking/actions';
import { updateBookingApiCall } from '@/app/(dashboard)/(private)/client/booking/actions';



const shouldDisableDate = (date: Dayjs) => {
  const today = dayjs().startOf('day');
  const startSelectableDate = today.add(8, 'day');
  const endSelectableDate = startSelectableDate.add(28, 'day');

  return date.isBefore(today) ||
    (date.isAfter(today) && date.isBefore(startSelectableDate)) ||
    date.isAfter(endSelectableDate);
};





interface EditBookingProps {
  open: boolean;
  handleClose: () => void;
  onConfirm: (data: FormData) => void;
  fetchBooking: () => void;
  bookingData
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








const EditBookingDialog: React.FC<EditBookingProps> = ({
  open,
  handleClose,
  bookingData,
  fetchBooking
}) => {

  dayjs.extend(utc);
  dayjs.extend(timezone);


  const [dateError, setDateError] = useState<string | null>(null);
  const [initData, setInitData] = useState(null)





  const schema = yup.object().shape({
  });

  const defaultValues = {
    clientName: initData?.ClientName,
    clientPhone: initData?.ClientPhoneNo,
    clientEmail: initData?.ClientEmailID,
    clientTime: `${dayjs(initData?.BookingDateTime).format('hh:mm A')} to ${dayjs(initData?.EndTime).format('hh:mm A')}`,
  };


  const {
    control,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues
  });

  const handleDialogClose = () => {
    reset();
    setDateError(null);
    handleClose();
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

  const [bookingDate, setBookingDate] = useState('')

  const [availableTimes, setAvailableTimes] = useState([])
  const [selectedTime, setSelectedTime] = useState<Dayjs | null>(null);

  const [carers, setCarers] = useState([])
  const [selectedCarer, setSelectedCarer] = useState('');

  const [selectedDescrr, setSelectedDescrr] = useState('')


  // prefilling Data

  useEffect(() => {
    if (initData) {
      setSelectedService(initData.ServiceID)
      setSelectedDuration(initData.Duration)

      setBookingDate(dayjs(initData.BookingDateTime).format('YYYY-MM-DD'))
      setSelectedTime(dayjs(initData?.BookingDateTime))
      setSelectedCarer(initData.CarerID)
      setSelectedDescrr(initData.Descr)
    }
  }, [initData])




  useEffect(() => {
    const fetchData = async () => {
      const data = await getClientServicesApiCall();
      if (data) {
        setServices(data as any);
      }
    };
    fetchData();
  }, [open]);


  useEffect(() => {
    const selectedServiceObj = services.filter(service => service.ServiceID === selectedService)
    setDurations(selectedServiceObj[0]?.Durations)
  }, [selectedService])


  useEffect(() => {
    const fetchTimeslots = async () => {
      try {


        const service = services.filter((service) => (service.ServiceID == selectedService))
        const duration = service && service[0]?.Durations.filter((duration) => (duration.Duration == selectedDuration))


        const timeslots = await getTimeslotsApiCall(selectedService, duration[0].ServiceDurationID, bookingDate, bookingData.BookingID);


        if (Array.isArray(timeslots)) {
          setAvailableTimes(timeslots);
        }

      } catch (error) {
        console.error("Error fetching timeslots:", error);
      }
    };

    // if (bookingDate) {
    fetchTimeslots()

    // }
  }, [bookingDate, selectedDuration, selectedService, selectedCarer, open])






  useEffect(() => {
    const fetchCarers = async () => {
      try {

        const dateStr1 = bookingDate
        const dateStr2 = selectedTime

        const datePart = dayjs(dateStr1).format("YYYY-MM-DD");
        const timePart = dayjs(dateStr2).format("HH:mm:ss");

        const combinedDateTime = `${datePart}T${timePart}`




        const carers = await getClientCarerApiCall(selectedService, selectedDuration, combinedDateTime, bookingData.BookingID);

        if (Array.isArray(carers)) {
          setCarers(carers);
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
      setTimeError('No time slots available for selected date');
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






  const handleEditConfirm = async () => {


    try {


      const dateStr1 = bookingDate
      const dateStr2 = selectedTime

      const datePart = dayjs(dateStr1).format("YYYY-MM-DD");
      const timePart = dayjs(dateStr2).format("HH:mm:ss");



      const combinedDateTime = `${datePart}T${timePart}`



      const bookingDataToPost = [
        {
          bookingDateTime: combinedDateTime,
          clientID: initData.ClientID,
          serviceID: selectedService,
          carerID: selectedCarer,
          duration: selectedDuration,
          descr: selectedDescrr, // Fixed typo from selectedDescr to selectedDescrr
          selectedBookingID: bookingData.BookingID
        }
      ];



      const result = await updateBookingApiCall(bookingDataToPost);

      if (result) {
        fetchBooking()
        toast.success('Booking updated successfully');
      }
    } catch (err) {
      console.error("Error updating booking:", err);
      toast.error('Failed to update booking');
    } finally {
      handleDialogClose();
    }


  }

  const onSubmit = async (data: any) => {

  };




  const isDuration = durations?.some(item => item.Duration == selectedDuration);

  return (

    <form id="booking-form" onSubmit={(e) => {
      e.preventDefault()
      handleSubmit(onSubmit)(e);
    }}>
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
            Edit Booking
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


              <Grid item xs={12}>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 4,
                    borderRadius: '8px',
                    backgroundColor: 'rgba(0, 128, 0, 0.05)'
                  }}
                >
                  <Grid container spacing={8}>
                    <Grid item xs={12} sm={6}>
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary" className='mb-0.5' gutterBottom>
                          Client
                        </Typography>
                        <Typography variant="body1">
                          {defaultValues.clientName}
                        </Typography>
                      </Box>
                      <Box mt={2}>
                        <Typography variant="subtitle2" color="text.secondary" className='mb-0.5' gutterBottom>
                          Phone
                        </Typography>
                        <Typography variant="body1">
                          {defaultValues.clientPhone}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary" className='mb-0.5' gutterBottom>
                          Email
                        </Typography>
                        <Typography variant="body1">
                          {defaultValues.clientEmail}
                        </Typography>
                      </Box>
                      <Box mt={2}>
                        <Typography variant="subtitle2" color="text.secondary" className='mb-0.5' gutterBottom>
                          Time
                        </Typography>
                        <Typography variant="body1">
                          {defaultValues.clientTime}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>




              <Grid item xs={12} sm={6}>
                <Controller
                  name='service'
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      select
                      fullWidth
                      label="Service"
                      // error={!!errors.service}
                      // helperText={errors.service?.message as string}
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
                      // // error={!!errors.duration}
                      // helperText={errors.duration?.message as string}
                      value={selectedDuration}
                      onChange={(e) => {
                        field.onChange(e);
                        setSelectedDuration(e.target.value as any);
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
                        setBookingDate(dayjs(newValue).format('YYYY-MM-DD'))
                      }}
                      value={dayjs(bookingDate)}
                      format="DD/MM/YYYY"
                      shouldDisableDate={shouldDisableDate}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          error: isTimeSlotDisabled,
                          helperText: (isTimeSlotDisabled && 'No carer is available for the selected date. Please select a different date')
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
                      disabled={isTimeSlotDisabled}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          error: !!timeError,
                          helperText: timeError || ''
                        }
                      }}
                    />
                  )}
                />
              </Grid>




              <Grid item xs={12}>
                <Controller
                  name='carer'
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      select
                      fullWidth
                      label="Carer"
                      // // error={!!errors.carer}
                      onChange={(e) => {
                        field.onChange(e);
                        setSelectedCarer(e.target.value)
                      }}
                      value={selectedCarer}
                      disabled={isTimeSlotDisabled}
                    // helperText={errors.carer?.message as string}
                    >
                      {carers.map((carer) => (
                        <MenuItem key={carer.CarerID} value={carer.CarerID}>
                          {carer.CarerName}
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
                    // // error={!!errors.description}
                    // helperText={errors.description?.message as string}
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
            onClick={handleEditConfirm}
            disabled={isTimeSlotDisabled || !isDuration || !!timeError || !selectedTime}
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

export default EditBookingDialog;


