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
    Box,
    FormControl,
    InputLabel,
    Select,
    FormControlLabel,
    Checkbox
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


import { confirmBookingApiCall, getClientServicesApiCall } from '@/views/client/booking/actions';
import { getTimeslotsApiCall } from '@/views/client/booking/actions';
import { getClientCarerApiCall } from '@/views/client/booking/actions';
import { updateBookingApiCall } from '@/views/client/booking/actions';
import { getAvailableDates } from '@/views/client/booking/actions';


import { getClientListApiCall } from './action'

dayjs.extend(utc);
dayjs.extend(timezone);

interface EditBookingProps {
    open: boolean;
    handleClose: () => void;
    onConfirm: () => void;
    fetchBooking: () => void;
    bookingData?: any
}

interface FormData {
    bookingDate: any;
    startTime: any;
    service: string;
    duration: string;
    client: string;
    carer: string;
    description: string;
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


const AddNewBooking: React.FC<EditBookingProps> = ({
    open,
    handleClose,
    bookingData,
    fetchBooking
}) => {
    // Form state
    const [services, setServices] = useState([]);
    const [durations, setDurations] = useState([]);
    const [availableTimes, setAvailableTimes] = useState([]);
    const [carers, setCarers] = useState([]);
    const [clients, setClients] = useState([]);

    // Selected values
    const [selectedService, setSelectedService] = useState(null);
    const [selectedDuration, setSelectedDuration] = useState<any>('');
    const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);
    const [selectedTime, setSelectedTime] = useState<Dayjs | null>(null);
    const [selectedCarer, setSelectedCarer] = useState('');
    const [selectedClient, setSelectedClient] = useState('');
    const [selectedDescription, setSelectedDescription] = useState('');

    // UI state
    const [timeError, setTimeError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Enable states for sequential selection
    const [enableDuration, setEnableDuration] = useState(false);
    const [enableDate, setEnableDate] = useState(false);
    const [enableTime, setEnableTime] = useState(false);
    const [enableCarer, setEnableCarer] = useState(false);
    const [enableClient, setEnableClient] = useState(false);
    const [enableDescription, setEnableDescription] = useState(false);

    // Recurring booking states
    const [isRecurring, setIsRecurring] = useState(false);
    const [repeatFrequency, setRepeatFrequency] = useState('weekly');
    const [durationOption, setDurationOption] = useState('1 Month');
    const [customRange, setCustomRange] = useState('week');
    const [customDuration, setCustomDuration] = useState<any>(2);



    const [allBookings, setAllBookings] = useState([]);

    const [dates, setDates] = useState([])

    const schema = yup.object().shape({
        service: yup.string().optional(),
        duration: yup.string().optional(),
        bookingDate: yup.date().nullable().optional(),
        startTime: yup.date().nullable().optional(),
        carer: yup.string().optional(),
        clientName: yup.string().optional(),
        description: yup.string().optional()
    });


    type FormValidate = yup.InferType<typeof schema>

    const { control, reset } = useForm<FormValidate>({
        resolver: yupResolver(schema),
    });

    // Reset form when opening/closing
    const handleDialogClose = () => {
        reset();
        setSelectedService('');
        setSelectedDuration('');
        setSelectedDate(null);
        setSelectedTime(null);
        setSelectedCarer('');
        setSelectedClient('');
        setSelectedDescription('');
        setEnableDuration(false);
        setEnableDate(false);
        setEnableTime(false);
        setEnableCarer(false);
        setEnableClient(false);
        setEnableDescription(false);
        setTimeError(null);
        setIsRecurring(false);
        setAllBookings([]);
        handleClose();
    };

    // Generate recurring message based on selections

    const calculateEndDate = () => {

        const startDate = dayjs(selectedDate);
        let endDate = startDate;

        if (durationOption === 'Custom') {
            if (customRange === 'week') {
                endDate = startDate.add(customDuration, 'week');
            } else {
                endDate = startDate.add(customDuration, 'month');
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

        const startDate = dayjs(selectedDate);
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


    //SEQUENTIAL DATA FETCHING
    // Fetch initial data
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const [servicesData, clientsData] = await Promise.all([
                    getClientServicesApiCall(),
                    getClientListApiCall(),
                ]);
                setServices(servicesData as any[]);
                setClients(clientsData as any[]);
            } catch (error) {
                console.error('Error fetching initial data:', error);
                toast.error('Failed to load initial data');
            }
        };

        if (open) {
            fetchInitialData();
        }
    }, [open]);

    // When service is selected, enable duration and load durations
    useEffect(() => {
        if (selectedService) {
            const service = services.find(s => s.ServiceID === selectedService);
            if (service) {
                setDurations(service.Durations);
                setEnableDuration(true);
            }
        } else {
            setEnableDuration(false);
            setSelectedDuration('');
        }
    }, [selectedService, services]);

    // When duration is selected, enable date
    useEffect(() => {
        setEnableDate(!!selectedDuration);

        (async () => {
            if (selectedService) {
                const availableDates = await getAvailableDates(selectedService, null);
                if (availableDates) {
                    setDates(availableDates as any[]);
                }
            }
        })();



        if (!selectedDuration) {
            setSelectedDate(null);
            setEnableTime(false);
        }
    }, [selectedDuration]);

    // When date is selected, fetch available times and enable time
    useEffect(() => {
        const fetchTimes = async () => {
            if (selectedDate && selectedDuration && selectedService) {
                setIsLoading(true);
                try {
                    const service = services.find(s => s.ServiceID === selectedService);
                    const duration = service?.Durations.find(d => d.Duration === selectedDuration);

                    if (duration) {
                        const timeslots = await getTimeslotsApiCall(
                            selectedService,
                            duration.ServiceDurationID,
                            selectedDate.format('YYYY-MM-DD'),
                            bookingData?.BookingID || null
                        );

                        setAvailableTimes((timeslots as any[]) || []);
                        setEnableTime(true);
                    }
                } catch (error) {
                    console.error('Error fetching timeslots:', error);
                    toast.error('Failed to load available times');
                } finally {
                    setIsLoading(false);
                }
            } else {
                setEnableTime(false);
                setSelectedTime(dayjs().set('hour', 8).set('minute', 0).set('second', 0));
            }
        };

        fetchTimes();
    }, [selectedDate, selectedDuration, selectedService]);

    // When time is selected, fetch carers and enable carer
    useEffect(() => {
        const fetchCarers = async () => {
            if (selectedTime && selectedDate && selectedService && selectedDuration) {
                setIsLoading(true);
                try {
                    const combinedDateTime = selectedDate
                        .hour(selectedTime.hour())
                        .minute(selectedTime.minute())
                        .second(0)
                        .format('YYYY-MM-DD HH:mm:ss');

                    const carersData = await getClientCarerApiCall(
                        selectedService,
                        selectedDuration,
                        combinedDateTime,
                        bookingData?.BookingID || null
                    );

                    setCarers(carersData as any || []);
                    setEnableCarer(true);
                } catch (error) {
                    console.error('Error fetching carers:', error);
                    toast.error('Failed to load available carers');
                } finally {
                    setIsLoading(false);
                }
            } else {
                setEnableCarer(false);
                setSelectedCarer('');
            }
        };

        fetchCarers();
    }, [selectedTime, selectedDate, selectedService, selectedDuration]);

    // When carer is selected, enable client
    useEffect(() => {
        setEnableClient(!!selectedCarer);
        if (!selectedCarer) {
            setSelectedClient('');
        }
    }, [selectedCarer]);

    // When client is selected, enable description
    useEffect(() => {
        setEnableDescription(!!selectedClient);
    }, [selectedClient]);




    const shouldDisableDate = (date) => {
        // Convert the input date to YYYY-MM-DD format for comparison

        const dateString = dayjs(date).format('YYYY-MM-DD');

        // Find the date in your availability data
        const dateAvailability = dates?.find(d =>
            dayjs(d.Date).format('YYYY-MM-DD') === dateString
        );

        // If the date is not found in the availability data, disable it
        if (!dateAvailability) return true;

        // Disable the date if IsCarerAvailable is false
        return !dateAvailability.IsCarerAvailable;
    };



    const shouldDisableTime = (timeValue: Dayjs) => {


        if (!availableTimes || availableTimes.length === 0) {
            // setTimeError('No time slots available for selected date');
            return true;
        }

        const timeString = timeValue.format('HH:mm:ss');

        const lastSlot = dayjs(availableTimes[availableTimes.length - 1].TimeSlot).utc().format('HH:mm:ss');
        const ignoreSlots = [];

        // Extract hours and minutes from the last slot
        const [hours, minutes] = lastSlot.split(':').map(Number);

        // Generate next 3 slots (15, 30, 45 minutes after)
        for (let i = 1; i <= 3; i++) {
            const newMinutes = minutes + (i * 15);
            const newHours = hours + Math.floor(newMinutes / 60);
            const finalMinutes = newMinutes % 60;

            // Format with leading zeros
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




        if (!timeSlot?.IsCarerAvailable) {
            // setTimeError('Please select an available time slot');
            return true;
        }

        setTimeError(null);
        return false;
    };




    const handleConfirm = async () => {
        try {
            setIsLoading(true);



            // Recurring conversions -------------------------------------------------------------------------------

            if (isRecurring) {

                if (customRange == '' || customDuration == '' || durationOption == '' || repeatFrequency == '') {
                    return
                }
                setIsLoading(true);


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
            }

            //////////////////////////////////////////////////////////////////




            const dateStr1 = dayjs(selectedDate).format('YYYY-MM-DD')
            const dateStr2 = selectedTime

            const datePart = dayjs(dateStr1).format("YYYY-MM-DD");
            const timePart = dayjs(dateStr2).format("HH:mm:ss");


            const combinedDateTime = `${datePart}T${timePart}.000Z`


            const bookingPayload = {
                bookingDateTime: combinedDateTime,
                clientID: selectedClient,
                serviceID: selectedService,
                carerID: selectedCarer,
                duration: selectedDuration,
                descr: selectedDescription,
                selectedBookingID: bookingData?.BookingID || null,

                isRecurring: isRecurring,
                frequencyInterval: isRecurring ? parseInt(frequencyInterval) : null,
                frequencyDuration: isRecurring ? parseInt(frequencyDuration) : null,
                frequencyType: isRecurring ? parseInt(frequencyType) : null
            };

            let payloads = [bookingPayload];

            if (isRecurring) {
                // Generate recurring bookings based on the configuration
                // This is a simplified example - you'll need to implement the actual logic
                // for generating the series of bookings based on the recurrence pattern
                const recurringBookings = generateRecurringBookings(bookingPayload);
                payloads = [...payloads, ...recurringBookings];
            }

            const result = bookingData?.BookingID
                ? await updateBookingApiCall(payloads)
                : await confirmBookingApiCall(payloads);

            if (result) {
                fetchBooking();
                toast.success(`Booking ${bookingData?.BookingID ? 'updated' : 'created'} successfully`);
                handleDialogClose();
            }
        } catch (error) {
            console.error('Error saving booking:', error);
            toast.error(`Failed to ${bookingData?.BookingID ? 'update' : 'create'} booking`);
        } finally {
            setIsLoading(false);
        }
    };

    // Helper function to generate recurring bookings (simplified example)
    const generateRecurringBookings = (baseBooking: any) => {
        const bookings = [];
        // Implement your actual recurrence logic here
        // This is just a placeholder to show the concept
        return bookings;
    };

    const isFormValid = () => {
        return selectedService &&
            selectedDuration &&
            selectedDate &&
            selectedTime &&
            selectedCarer &&
            selectedClient &&
            (!isRecurring || (
                repeatFrequency &&
                durationOption &&
                (durationOption !== 'Custom' || (customDuration && customRange))
            ));
    };

    return (
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
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
                }
            }}
        >
            <DialogTitle sx={{
                px: 4,
                py: 3,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
            }}>
                <Typography variant='h5' sx={{ fontWeight: 600 }}>
                    {bookingData?.BookingID ? 'Edit Booking' : 'Add New Booking'}
                </Typography>
                <IconButton onClick={handleDialogClose}>
                    <i className="ri-close-line text-2xl" />
                </IconButton>
            </DialogTitle>

            <Divider />

            <DialogContent sx={{ px: 4, py: 3 }}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <Grid container spacing={6}>
                        {/* Service Selection */}
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
                                            setSelectedService(e.target.value);

                                            setSelectedDate(null)
                                            setSelectedDuration(''); // Reset duration when service changes
                                            setSelectedTime(null); // Reset time when date changes
                                            setSelectedCarer(null); // Reset carer when date changes
                                        }}
                                        disabled={isLoading}
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

                        {/* Duration Selection */}
                        <Grid item xs={12} sm={6}>
                            <Controller
                                name="duration"
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
                                            setSelectedDuration(e.target.value);
                                            setSelectedTime(null); // Reset time when date changes
                                            setSelectedCarer(null); // Reset carer when date changes
                                        }}
                                        disabled={!enableDuration || isLoading}
                                    >
                                        {durations.map((duration) => (
                                            <MenuItem key={duration.ServiceDurationID} value={duration.Duration}>
                                                {duration.Duration} Hours
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                )}
                            />
                        </Grid>

                        {/* Date Selection */}
                        <Grid item xs={12} sm={6}>
                            <Controller
                                name="bookingDate"
                                control={control}
                                render={({ field }) => (
                                    <DatePicker
                                        label="Booking Date"
                                        value={selectedDate}
                                        onChange={(newValue) => {
                                            field.onChange(newValue);
                                            setSelectedDate(newValue);
                                            setSelectedTime(dayjs().set('hour', 8).set('minute', 0).set('second', 0)); // Reset time when date changes
                                            setSelectedCarer(null); // Reset carer when date changes
                                        }}
                                        format='DD/MM/YYYY'
                                        shouldDisableDate={shouldDisableDate}
                                        disabled={!enableDate || isLoading}
                                        slotProps={{
                                            textField: {
                                                fullWidth: true,
                                            }
                                        }}
                                    />
                                )}
                            />
                        </Grid>

                        {/* Time Selection */}
                        <Grid item xs={12} sm={6}>
                            <Controller
                                name="startTime"
                                control={control}
                                render={({ field }) => (
                                    <TimePicker
                                        label="Start Time"
                                        value={selectedTime}
                                        onChange={(newValue) => {
                                            field.onChange(newValue);
                                            setSelectedTime(newValue);
                                            setSelectedCarer(null); // Reset carer when time changes
                                        }}
                                        shouldDisableTime={shouldDisableTime}
                                        disabled={!enableTime || isLoading}
                                        timeSteps={{ minutes: 15 }}
                                        ampm
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

                        {/* Carer Selection */}
                        <Grid item xs={12} sm={6}>
                            <Controller
                                name="carer"
                                control={control}
                                render={({ field, fieldState: { error } }) => (
                                    <TextField
                                        {...field}
                                        select
                                        fullWidth
                                        label="Carer"
                                        value={selectedCarer}
                                        onChange={(e) => {
                                            field.onChange(e);
                                            setSelectedCarer(e.target.value);
                                        }}
                                        disabled={!enableCarer || isLoading}
                                    // error={ selectedTime && (!!error || carers?.filter(carer => carer.IsAvailable).length === 0)}
                                    // helperText={
                                    //     error?.message ||
                                    //     ( selectedTime && carers?.filter(carer => carer.IsAvailable).length === 0
                                    //         ? "No carer is available"
                                    //         : "")
                                    // }
                                    >
                                        {carers.map((carer) => (
                                            <MenuItem key={carer.CarerID} value={carer.CarerID} disabled={!carer.IsAvailable}>
                                                {carer.CarerName}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                )}
                            />
                        </Grid>

                        {/* Client Selection */}
                        <Grid item xs={12} sm={6}>
                            <Controller
                                name="clientName"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        select
                                        fullWidth
                                        label="Client"
                                        value={selectedClient}
                                        onChange={(e) => {
                                            field.onChange(e);
                                            setSelectedClient(e.target.value);
                                        }}
                                        disabled={!enableClient || isLoading}
                                    >
                                        {clients.map((client) => (
                                            <MenuItem key={client.ClientID} value={client.ClientID}>
                                                {client.ClientName}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                )}
                            />
                        </Grid>

                        {/* Description */}
                        <Grid item xs={12}>
                            <Controller
                                name="description"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        fullWidth
                                        multiline
                                        rows={4}
                                        label="Description"
                                        value={selectedDescription}
                                        onChange={(e) => {
                                            field.onChange(e);
                                            setSelectedDescription(e.target.value);
                                        }}
                                        disabled={!enableDescription || isLoading}
                                    />
                                )}
                            />
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
                                                        {repeatOptions.map((option) => (
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
                                                <FormControl fullWidth error={durationOption === ''}>
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
                                                        customDuration < 1 ||
                                                        customDuration > (customRange === 'week' ? 52 : 12)
                                                    }
                                                    helperText={
                                                        customDuration === ''
                                                            ? 'Duration is required'
                                                            : customDuration < 1
                                                                ? 'Minimum is 1'
                                                                : customDuration > (customRange === 'week' ? 52 : 12)
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

            <DialogActions sx={{ justifyContent: 'space-between', px: 4, py: 3 }}>
                <Button
                    variant="contained"
                    onClick={handleConfirm}
                    disabled={!isFormValid() || isLoading}
                >
                    Save
                </Button>
                <Button
                    variant="outlined"
                    color="error"
                    onClick={handleDialogClose}
                    disabled={isLoading}
                >
                    Cancel
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default AddNewBooking;