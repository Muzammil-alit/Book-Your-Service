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
  Chip,
  Skeleton,
  Checkbox,
  FormControlLabel,
  Box,
  FormControl,
  InputLabel,
  Select
} from '@mui/material';
import { LocalizationProvider, DatePicker, TimePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import { useForm, Controller } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useEffect } from 'react';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { toast } from 'react-toastify';


import { getBookingbyIDApiCall } from '../action';
import { getClientServicesApiCall } from '@/views/client/booking/actions';
import { getTimeslotsApiCall } from '@/views/client/booking/actions';
import { getClientCarerApiCall } from '@/views/client/booking/actions';
import { getAvailableDates } from '@/views/client/booking/actions';

import { updateBookingApiCall } from '@/views/client/booking/actions';

import { formatTimeTo } from '@/utils/commonFunction';







interface BookingData {
  BookingID: string;
  ServiceID?: string;
  ClientID?: string;
  ClientName?: string;
  ClientPhoneNo?: string;
  ClientEmailID?: string;
  BookingDateTime?: string | Date;
  EndTime?: string;
  CarerID?: string;
  Descr?: string;
  RecurringBookingID?: string;
  FrequencyInterval?: number;
  FrequencyType?: number;
  FrequencyDuration?: number;
  StartDate?: string;
  BookingStatus?: number;
  // Add other fields as needed
}

interface EditBookingProps {
  title: string;
  fetchBooking: () => void;
  open: boolean;
  handleClose: () => void;
  onConfirm: (data: FormData) => void;
  bookingData: BookingData;
}


interface FormData {
  bookingDate?: any;
  startTime?: any;
  service?: string;
  duration?: string;
  clientName?: string;
  clientPhone?: string;
  clientEmail?: string;
  clientTime?: string;
  carer?: string;
  description?: string;
}






// Recurring booking options
const repeatOptions = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'fortnightly', label: 'Every Second Week (Fortnightly)' },
  { value: 'monthly', label: 'Monthly' }
];

const durationOptions = {
  daily: [
    '1 Week', '2 Week', '3 Week',
    '1 Month', '2 Month', '3 Month', '6 Month', '1 Year',
    'Custom'
  ],
  weekly: [
    '2 Week', '3 Week',
    '1 Month', '2 Month', '3 Month', '6 Month', '1 Year',
    'Custom'
  ],
  fortnightly: [
    '1 Month', '2 Month', '3 Month', '6 Month', '1 Year',
    'Custom'
  ],
  monthly: [
    '2 Month', '3 Month', '6 Month', '1 Year',
    'Custom'
  ]
};







const EditBookingDialog: React.FC<EditBookingProps> = ({
  title,
  open,
  handleClose,
  bookingData,
  fetchBooking
}) => {

  dayjs.extend(utc);
  dayjs.extend(timezone);


  const [initData, setInitData] = useState<BookingData | null>(null)




  const [services, setServices] = useState<any>('');
  const [selectedService, setSelectedService] = useState<number | null>(null);

  const [durations, setDurations] = useState([])
  const [selectedDuration, setSelectedDuration] = useState<number | null>(null);

  const [bookingDate, setBookingDate] = useState('');

  const [dates, setDates] = useState(null)

  const [availableTimes, setAvailableTimes] = useState<object | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | Dayjs>('');

  const [carers, setCarers] = useState<any>('');
  const [selectedCarer, setSelectedCarer] = useState('');

  const [selectedDescrr, setSelectedDescrr] = useState('')



  // Recurring booking states
  const [isRecurring, setIsRecurring] = useState(false);
  const [repeatFrequency, setRepeatFrequency] = useState('weekly');
  const [durationOption, setDurationOption] = useState('1 Month');
  const [customRange, setCustomRange] = useState('week');
  const [customDuration, setCustomDuration] = useState<number | string>(2);










  const schema = yup.object().shape({
    bookingDate: yup.mixed().nullable(),
    startTime: yup.mixed().nullable(),
    service: yup.string().required('Service is required'),
    duration: yup.string().required('Duration is required'),
    clientName: yup.string().nullable(),
    clientPhone: yup.string().nullable(),
    clientEmail: yup.string().nullable(),
    clientTime: yup.string().nullable(),
    carer: yup.string().required('Carer is required'),
    description: yup.string().nullable(),
  });

  const defaultValues = {
    clientName: initData?.ClientName,
    clientPhone: initData?.ClientPhoneNo,
    clientEmail: initData?.ClientEmailID,
    clientTime: `${typeof initData?.BookingDateTime === 'string'
      ? formatTimeTo(initData?.BookingDateTime.split('T')[1])
      : formatTimeTo(dayjs(initData?.BookingDateTime).format('HH:mm:ss'))
      } to ${typeof initData?.EndTime === 'string'
        ? formatTimeTo(initData?.EndTime.split('T')[1])
        : formatTimeTo(dayjs(initData?.EndTime).format('HH:mm:ss'))
      }`,
  }


  type FormValidateType = yup.InferType<typeof schema>

  const {
    control,
    handleSubmit,
    reset
  } = useForm<FormValidateType>({
    resolver: yupResolver(schema),
    defaultValues
  });

  const handleDialogClose = () => {
    reset();
    setIsRecurring(false)
    setRepeatFrequency('weekly')
    setCustomRange('week')
    setCustomDuration(2)
    setDurationOption('1 Month');
    handleClose();
  };



  const [loading, setLoading] = useState(false); // Add loading state

  useEffect(() => {
    if (open && bookingData?.BookingID) {
      const fetchBookingData = async () => {
        setLoading(true); // Set loading to true when fetching starts
        try {
          const res = await getBookingbyIDApiCall(Number(bookingData?.BookingID)) as any;
          if (Array.isArray(res)) {
            setInitData(res[0]);
          }

          // Only set prefilled values after data is loaded
          if (res[0]) {
            setSelectedService(res[0].ServiceID);
            setSelectedDuration(res[0].Duration);
            setBookingDate(dayjs(res[0].BookingDateTime).format('YYYY-MM-DD'));
            setSelectedTime(dayjs(res[0]?.BookingDateTime).utc());
            setSelectedCarer(res[0].CarerID);
            setSelectedDescrr(res[0].Descr);
          }
        } catch (error) {
          console.error('Error fetching booking data:', error);
        } finally {
          // setLoading(false);
        }
      };

      fetchBookingData();
    }
  }, [open, bookingData]);







  useEffect(() => {
    if (initData?.RecurringBookingID) {



      var repeat
      var type
      var duration


      setIsRecurring(initData?.RecurringBookingID ? true : false)

      switch (initData?.FrequencyInterval) {
        case 1: repeat = 'daily'
          break;
        case 2: repeat = 'weekly'
          break;
        case 3: repeat = 'fortnightly'
          break;
        case 4: repeat = 'monthly'
          break;
        default: repeat = 'weekly'
          break;
      }

      switch (initData?.FrequencyType) {
        case 1: type = 'Week';
          break
        case 2: type = 'Month';
          break
        case 3: type = 'Year';
          break
        default: type = 'Week';
          break // default fallback
      }

      duration = initData?.FrequencyDuration + " " + type

      const isCustom = ![
        '1 Week', '2 Week', '3 Week',
        '1 Month', '2 Month', '3 Month', '6 Month'
      ].includes(duration)


      if (isCustom) {
        setDurationOption('Custom')
        setCustomRange(initData?.FrequencyType == 1 ? 'week' : 'month')
        setCustomDuration(initData?.FrequencyDuration as number)
      }

      else {
        setRepeatFrequency(repeat)
        setDurationOption(duration)
      }





    }
  }, [initData])






  const fetchServices = async () => {
    const data = await getClientServicesApiCall();

    if (data) {
      setServices(data);
    }
  };



  const fetchTimeslots = async () => {
    try {

      const service = services.filter((service) => (service.ServiceID == selectedService))
      const duration = service && service[0]?.Durations.filter((duration) => (duration.Duration == selectedDuration))


      const timeslots = await getTimeslotsApiCall(selectedService, duration[0].ServiceDurationID, bookingDate, bookingData?.BookingID);


      if (Array.isArray(timeslots)) {
        setAvailableTimes(timeslots as any);
      }

    } catch (error) {
      // console.error("Error fetching timeslots:", error);
    }
  };
  const fetchCarers = async () => {
    try {
      const dateStr1 = bookingDate;
      const dateStr2 = selectedTime;

      const datePart = dayjs(dateStr1).format("YYYY-MM-DD");
      const timePart = dayjs(dateStr2).format("HH:mm:ss");

      const combinedDateTime = `${datePart}T${timePart}`;



      const carers = await getClientCarerApiCall(
        selectedService,
        selectedDuration,
        combinedDateTime,
        bookingData.BookingID
      );

      setCarers(carers);

    } catch (error) {
      // console.error("Error fetching timeslots:", error);
    }
    finally {
      setLoading(false); // Set loading to false when done
    }
  };

  const fetchDates = async () => {
    const availableDates = await getAvailableDates(bookingData?.ServiceID, bookingData?.BookingID);
    if (availableDates) {
      setDates(availableDates);
    }
  };


  useEffect(() => {
    fetchServices();
    fetchDates()
  }, [open]);


  useEffect(() => {
    if (!selectedService) return;

    if (services) {
      const selectedServiceObj = services.filter(service => service.ServiceID === selectedService)
      setDurations(selectedServiceObj[0]?.Durations)

    }
  }, [services, selectedService])


  useEffect(() => {
    if (bookingDate && selectedDuration && selectedService) {
      fetchTimeslots();
    }
  }, [bookingDate, selectedDuration, selectedService])


  useEffect(() => {
    if (selectedTime && selectedService && selectedDuration && bookingDate) {
      fetchCarers();
    }
  }, [selectedTime, bookingDate, selectedService, selectedDuration]);




  // Custom function to disable unavailable times
  const [timeError, setTimeError] = useState<string | null>(null);




  const shouldDisableTime = (timeValue: Dayjs) => {


    if (!availableTimes || availableTimes?.length === 0) {
      // setTimeError('No time slots available for selected date');
      return true;
    }

    const timeString = timeValue.format('HH:mm:ss');




    const lastSlot = dayjs(availableTimes[availableTimes.length - 1].TimeSlot).utc().format('HH:mm:ss');
    const ignoreSlots = [];

    // Extract hours and minutes from the last slot
    const [hours, minutes] = lastSlot.split(':').map(Number);

    for (let i = 1; i <= 3; i++) {
      const newMinutes = minutes + (i * 15);
      const newHours = hours + Math.floor(newMinutes / 60);
      const finalMinutes = newMinutes % 60;

      const formattedHours = String(newHours).padStart(2, '0');
      const formattedMinutes = String(finalMinutes).padStart(2, '0');

      ignoreSlots.push(`${formattedHours}:${formattedMinutes}:00`);
    }


    if (ignoreSlots.includes(timeString)) {    // Ignore subslot of the last slot to supress errror
      return true;
    }
    else {
      var timeSlot = availableTimes.find(t =>
        dayjs(t.TimeSlot).utc().format('HH:mm:ss') === timeString
      );

    }

    if (!timeSlot?.IsCarerAvailable && !loading) {
      // setTimeError('Please select an available time slot');
      return true;
    }

    setTimeError(null);
    return false;
  };




  const isTimeSlotDisabled = availableTimes && !availableTimes?.some(
    (slot) => slot.IsCarerAvailable === true
  );

  const isDuration = durations?.some(item => item.Duration == selectedDuration);





  const handleEditConfirm = async () => {


    try {


      const dateStr1 = bookingDate
      const dateStr2 = selectedTime


      const datePart = dayjs(dateStr1).format("YYYY-MM-DD");
      const timePart = dayjs(dateStr2).format("HH:mm:ss");



      const combinedDateTime = `${datePart} ${timePart}.000Z`






      var frequencyInterval: any = repeatFrequency
      var frequencyDuration: any
      var frequencyType: any

      if (durationOption == 'Custom') {
        frequencyDuration = customDuration
        frequencyType = customRange
      }
      else {
        frequencyDuration = durationOption.split(' ')[0]
        frequencyType = durationOption.split(' ')[1].toLocaleLowerCase()
      }


      switch (frequencyInterval) {
        case 'daily':
          frequencyInterval = 1;
          break;
        case 'weekly':
          frequencyInterval = 2;
          break;
        case 'fortnightly':
          frequencyInterval = 3;
          break;
        case 'monthly':
          frequencyInterval = 4;
          break;
      }

      // Convert frequencyType to the correct numeric value
      switch (frequencyType) {
        case 'week':
          frequencyType = 1;
          break;
        case 'month':
          frequencyType = 2;
          break;
        case 'year':
          frequencyType = 3;
          break;
      }






      const bookingDataToPost = [
        {
          bookingDateTime: combinedDateTime,
          clientID: initData.ClientID,
          serviceID: selectedService,
          carerID: selectedCarer,
          duration: selectedDuration,
          descr: selectedDescrr, // Fixed typo from selectedDescr to selectedDescrr
          selectedBookingID: bookingData.BookingID,

          isRecurring,
          frequencyInterval: isRecurring ? parseInt(frequencyInterval) : null,
          frequencyDuration: isRecurring ? parseInt(frequencyDuration) : null,
          frequencyType: isRecurring ? parseInt(frequencyType) : null
        }
      ];



      const result = await updateBookingApiCall(bookingDataToPost);

      if (result) {
        fetchBooking()
        toast.success('Booking updated successfully');
      }
    } catch (err) {
      toast.error('Failed to update booking');
    } finally {
      handleDialogClose();
    }


  }



  const shouldDisableDate = (date) => {
    // Convert the date to compare with your available dates
    const dateString = dayjs(date).format('YYYY-MM-DD');

    // Find if this date exists in your available dates
    const dateAvailability = dates?.find(d =>
      dayjs(d.Date).format('YYYY-MM-DD') === dateString
    );

    // Disable the date if it's not found or IsCarerAvailable is false
    return !dateAvailability || !dateAvailability.IsCarerAvailable;
  };




  function getStatus() {
    var status
    if (initData?.BookingStatus == 0) {
      return <Chip className='ms-4' size='small' color="warning" label="Pending" variant="outlined" >{status}</Chip>
    }
    else if (initData?.BookingStatus == 1) {
      return <Chip className='ms-4' size='small' color="success" label="Confirmed" variant="outlined" >{status}</Chip>
    }
    else {
      return <Chip className='ms-4' size='small' color="error" label="Cancelled" variant="outlined" >{status}</Chip>
    }
  }
  function getRecurring() {
    var status
    if (initData?.RecurringBookingID) {
      return <Chip className='ms-4 relative bottom-[4px] text-[#28a745] border-[#28a745]' size='small' label="Recurring" variant="outlined" ></Chip>
    }
  }


  // Generate recurring message based on selections

  const calculateEndDate = () => {


    const startDate = initData?.StartDate ? dayjs(initData?.StartDate) : dayjs(initData?.BookingDateTime);
    let endDate = startDate;

    if (durationOption === 'Custom') {
      if (customRange === 'week') {
        endDate = startDate.add(Number(customDuration), 'week');
      } else {
        endDate = startDate.add(Number(customDuration), 'month');
      }
    } else {
      if (durationOption.includes('Week')) {
        const week = parseInt(durationOption);
        endDate = startDate.add(week, 'week');
      } else if (durationOption.includes('Month')) {
        const month = parseInt(durationOption);
        endDate = startDate.add(month, 'month');
      }
      else if (durationOption.includes('Year')) {
        const year = parseInt(durationOption);
        endDate = startDate.add(year, 'year');
      }
    }

    endDate = endDate.subtract(1, 'day');

    return endDate.format('MMMM D, YYYY');
  };



  const generateRecurringMessage = () => {

    const startDate = initData?.StartDate ? dayjs(initData?.StartDate) : dayjs(initData?.BookingDateTime);
    const timeSlot = dayjs(selectedTime).format('hh:mm A');
    const dayName = startDate.format('dddd');
    const endDate = calculateEndDate();

    const Bold = ({ children }: { children: React.ReactNode }) => (
      <span className="font-semibold">&nbsp;{children}&nbsp;</span>
    );

    switch (repeatFrequency) {
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








  return (

    <form id="booking-form" onSubmit={handleSubmit(handleEditConfirm)}>
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
            {
              title ||
              'Edit Booking'

            }

            {getRecurring()}
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
              {!title && (
                <Grid item xs={12}>
                  {loading ? (
                    <Skeleton animation="wave" sx={{ borderRadius: '8px' }} variant="rectangular" height={140} />
                  ) : (
                    <Grid container spacing={8}>
                      <Grid item xs={12} sm={12}>
                        <div className="rounded-lg bg-slate-50 p-4 transition-all" style={{ backgroundColor: 'rgba(0, 128, 0, 0.05)' }}>
                          <h3 className="mb-3 font-medium text-slate-900">Client Information</h3>
                          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <div>
                              <p className="font-medium">{initData?.ClientName}</p>
                              <p className="text-sm text-slate-500">Name</p>
                            </div>
                            <div className='ms-2'>
                              <p className="font-medium">{initData?.ClientEmailID}</p>
                              <p className="text-sm text-slate-500">Email</p>
                            </div>
                            <div>
                              <p className="font-medium">{initData?.ClientPhoneNo}</p>
                              <p className="text-sm text-slate-500">Phone</p>
                            </div>
                            <div className='ms-2'>
                              <p className="font-medium">
                                {`${formatTimeTo(
                                  typeof initData?.BookingDateTime === 'string'
                                    ? initData?.BookingDateTime.split('T')[1]
                                    : dayjs(initData?.BookingDateTime).format('HH:mm:ss')
                                )} to ${formatTimeTo(
                                  typeof initData?.EndTime === 'string'
                                    ? initData?.EndTime.split('T')[1]
                                    : dayjs(initData?.EndTime).format('HH:mm:ss')
                                )}`}
                              </p>
                              <p className="text-sm text-slate-500">Time</p>
                            </div>
                          </div>
                        </div>
                      </Grid>
                    </Grid>
                  )}
                </Grid>
              )}

              <Grid item xs={12} sm={6}>
                {loading ? (
                  <Skeleton animation="wave" sx={{ borderRadius: '8px' }} variant="rectangular" height={56} />
                ) : (
                  <Controller
                    name='service'
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
                          setSelectedService(parseInt(e.target.value));

                          // setBookingDate('')
                          setSelectedDuration(null); // Reset duration when service changes
                          setSelectedTime(''); // Reset time when date changes
                          setSelectedCarer(''); // Reset carer when date changes
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
                )}
              </Grid>

              <Grid item xs={12} sm={6}>
                {loading ? (
                  <Skeleton animation="wave" sx={{ borderRadius: '8px' }} variant="rectangular" height={56} />
                ) : (
                  <Controller
                    name='duration'
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        select
                        fullWidth
                        label="Duration"
                        value={selectedDuration}
                        onChange={(e) => {
                          field.onChange(e);
                          setSelectedDuration(parseInt(e.target.value));

                          // setBookingDate('')
                          setSelectedTime(''); // Reset time when date changes
                          setSelectedCarer(''); // Reset carer when date changes
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
                )}
              </Grid>

              <Grid item xs={12} sm={4}>
                {loading ? (
                  <Skeleton animation="wave" sx={{ borderRadius: '8px' }} variant="rectangular" height={56} />
                ) : (
                  <Controller
                    name='bookingDate'
                    control={control}
                    render={({ field }) => (
                      <DatePicker
                        label="Booking Date"
                        onChange={(newValue) => {
                          field.onChange(newValue);
                          setBookingDate(dayjs(newValue).format('YYYY-MM-DD'));

                          setSelectedTime(''); // Reset time when date changes
                          setSelectedCarer(''); // Reset carer when date changes
                        }}
                        value={dayjs(bookingDate)}
                        format="DD/MM/YYYY"
                        shouldDisableDate={shouldDisableDate}
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            error: isTimeSlotDisabled,
                            helperText: isTimeSlotDisabled && 'No carer is available for the selected date. Please select a different date'
                          }
                        }}
                      />
                    )}
                  />
                )}
              </Grid>

              <Grid item xs={12} sm={4}>
                {loading ? (
                  <Skeleton animation="wave" sx={{ borderRadius: '8px' }} variant="rectangular" height={56} />
                ) : (
                  <Controller
                    name='startTime'
                    control={control}
                    render={({ field, fieldState: { error } }) => (
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

                          setSelectedCarer(''); // Reset carer when time changes
                        }}
                        value={dayjs(selectedTime)}
                        ampm
                        shouldDisableTime={shouldDisableTime}
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            error: !!error || !!timeError,
                            helperText: error?.message || timeError || ''
                          }
                        }}
                      />
                    )}
                  />
                )}
              </Grid>

              <Grid item xs={12} sm={4}>
                {loading ? (
                  <Skeleton animation="wave" sx={{ borderRadius: '8px' }} variant="rectangular" height={56} />
                ) : (
                  <Controller
                    name='carer'
                    control={control}
                    render={({ field, fieldState: { error } }) => (
                      <TextField
                        {...field}
                        select
                        fullWidth
                        label="Carer"
                        onChange={(e) => {
                          field.onChange(e);
                          setSelectedCarer(e.target.value);
                        }}
                        value={selectedCarer}
                      // error={!!error || carers?.filter(carer => carer.IsAvailable).length === 0}
                      // helperText={
                      //   error?.message ||
                      //   (carers?.filter(carer => carer.IsAvailable).length === 0
                      //     ? "No carer is available"
                      //     : "")
                      // }
                      >
                        {carers?.map((carer) => (
                          <MenuItem
                            key={carer.CarerID}
                            value={carer.CarerID}
                            disabled={!carer.IsAvailable}
                          >
                            {carer.CarerName}
                          </MenuItem>
                        ))}
                      </TextField>
                    )}
                  />
                )}
              </Grid>

              <Grid item xs={12}>
                {loading ? (
                  <Skeleton animation="wave" sx={{ borderRadius: '8px' }} variant="rectangular" height={140} />
                ) : (
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
                          setSelectedDescrr(e.target.value);
                        }}
                        label="Description"
                      />
                    )}
                  />
                )}
              </Grid>





              {/* Recurring Booking Configuration */}
              <Grid item xs={12} sx={{
                overflowX: 'hidden'
              }}>
                <Box >
                  <FormControlLabel

                    className='mb-2'
                    control={
                      <Checkbox
                        checked={isRecurring}
                        onChange={(e) => setIsRecurring(e.target.checked)}
                        color="primary"
                      />
                    }
                    label="Make it a recurring booking?"
                  />

                  {isRecurring && (

                    <Grid>
                      <div className={`flex flex-nowrap justify-between items-start  my-2`}>
                        {/* Repeat - 50% width normally, 24% when custom */}
                        <div
                          className="flex-shrink-0 transition-all duration-400 ease-in-out"
                          style={{
                            width: durationOption === 'Custom' ? '24%' : '49%',
                            minWidth: '200px',
                          }}
                        >
                          <FormControl fullWidth>
                            <InputLabel>Repeat</InputLabel>
                            <Select
                              value={repeatFrequency}
                              onChange={(e) => setRepeatFrequency(e.target.value)}
                              label="Repeat"
                            >
                              {repeatOptions?.map((option) => (
                                <MenuItem key={option.value} value={option.value}>
                                  {option.label}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </div>

                        {/* For - 50% width normally, 24% when custom */}
                        <div
                          className="flex-shrink-0 transition-all duration-400 ease-in-out"
                          style={{
                            width: durationOption === 'Custom' ? '24%' : '49%',
                            minWidth: '200px',
                          }}
                        >
                          <FormControl
                            fullWidth
                            error={durationOption === ''}
                          >
                            <InputLabel>For</InputLabel>
                            <Select
                              value={durationOption}
                              onChange={(e) => setDurationOption(e.target.value)}
                              label="For"
                            >
                              {durationOptions[repeatFrequency as keyof typeof durationOptions]?.map((option) => (
                                <MenuItem key={option} value={option}>
                                  {parseInt(option.split(' ')[0]) > 1 ? option + 's' : option}
                                </MenuItem>
                              ))}
                            </Select>
                            {durationOption === '' && (
                              <Typography variant="caption" color="error">
                                Duration is required
                              </Typography>
                            )}
                          </FormControl>
                        </div>

                        {/* Range - Hidden initially, shown when custom */}
                        <div
                          className="flex-shrink-0 transition-all duration-400 ease-in-out"
                          style={{
                            width: '24%',
                            minWidth: '200px',
                            visibility: durationOption === 'Custom' ? 'visible' : 'hidden',
                            opacity: durationOption === 'Custom' ? 1 : 0,
                            position: durationOption === 'Custom' ? 'relative' : 'absolute',
                          }}
                        >
                          <FormControl fullWidth>
                            <InputLabel>Range</InputLabel>
                            <Select
                              value={customRange}
                              onChange={(e) => setCustomRange(e.target.value)}
                              label="Range"

                            >
                              <MenuItem value="week">Weeks</MenuItem>
                              <MenuItem value="month">Months</MenuItem>
                            </Select>
                          </FormControl>
                        </div>

                        {/* Duration - Hidden initially, shown when custom */}
                        <div
                          className="flex-shrink-0 transition-all duration-400 ease-in-out"
                          style={{
                            width: '24%',
                            minWidth: '200px',
                            visibility: durationOption === 'Custom' ? 'visible' : 'hidden',
                            opacity: durationOption === 'Custom' ? 1 : 0,
                            position: durationOption === 'Custom' ? 'relative' : 'absolute',
                          }}
                        >
                          <TextField
                            fullWidth
                            type="number"
                            label="Duration"
                            value={customDuration}
                            onChange={(e) => {
                              const value = e.target.value;
                              const parsed = parseInt(value, 10);
                              const min = 1;
                              const max = customRange === 'week' ? 24 : 6;

                              if (value === '') {
                                setCustomDuration('');
                                return;
                              }

                              if (!isNaN(parsed) && parsed >= min && parsed <= max) {
                                setCustomDuration(parsed);
                              }
                            }}
                            error={
                              customDuration === '' ||
                              (typeof customDuration === 'number' && customDuration < 1) ||
                              (typeof customDuration === 'number' && customDuration > (customRange === 'week' ? 52 : 12))
                            }
                            helperText={
                              customDuration === ''
                                ? 'Duration is required'
                                : (typeof customDuration === 'number' && customDuration < 1)
                                  ? 'Minimum is 1'
                                  : (typeof customDuration === 'number' && customDuration > (customRange === 'week' ? 52 : 12))
                                    ? `Maximum is ${customRange === 'week' ? 52 : 12}`
                                    : ''
                            }
                            inputProps={{
                              min: 1,
                              max: customRange === 'week' ? 24 : 6,
                            }}
                          />
                        </div>





                      </div>


                      {
                        selectedTime &&
                        <Typography variant="body1" className='flex items-center'>
                          <i className="ri-time-line mr-1 pb-[1px]" style={{ fontSize: '17px' }}></i>
                          {generateRecurringMessage()}
                        </Typography>
                      }


                    </Grid>




                  )}
                </Box>
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
            disabled={isTimeSlotDisabled || !isDuration || !!timeError || !selectedTime || !selectedService || !selectedDuration || !bookingDate || !selectedCarer}
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


