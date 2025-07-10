'use client'

import React, { useState, useEffect } from 'react';
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
  Box,
  Radio,
  RadioGroup,
  FormControlLabel,
  Skeleton
} from '@mui/material';
import { LocalizationProvider, DatePicker, TimePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import { useForm, Controller, set } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { toast } from 'react-toastify';
import { getBookingbyIDApiCall } from '../admin/bookingRequests/action';
import { updateCompletionStatus } from './action';
import { formatTimeTo } from '@/utils/commonFunction';
import { useSelector } from 'react-redux';

interface EditBookingProps {
  open: boolean;
  handleClose: () => void;
  onConfirm: () => void;
  bookingData: any;
  fetchData: () => void;
}

interface FormData {
  shiftStatus: string;
  startDateActual: Dayjs | null;
  startTimeActual: Dayjs | null;
  endDateActual: Dayjs | null;
  endTimeActual: Dayjs | null;
  notes: string;
}






const EditBookingDialog: React.FC<EditBookingProps> = ({
  open,
  handleClose,
  bookingData,
  fetchData
}) => {
  const [dateError, setDateError] = useState<string | null>(null);
  const [initData, setInitData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const schema = yup.object().shape({
    shiftStatus: yup.string().required('Shift status is required'),
    startDateActual: yup.date().notRequired(),
    startTimeActual: yup.date().notRequired(),
    endDateActual: yup.date().notRequired(),
    endTimeActual: yup.date().notRequired(),
    notes: yup.string().max(5000, 'Notes cannot exceed 5000 characters')
  });

  type FormValidate = yup.InferType<typeof schema>

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch
  } = useForm<FormValidate>({
    resolver: yupResolver(schema),
    defaultValues: {
      shiftStatus: '',
      startDateActual: null,
      startTimeActual: null,
      endDateActual: null,
      endTimeActual: null,
      notes: ''
    }
  });

  const watchStartDate = watch('startDateActual');
  const watchEndDate = watch('endDateActual');
  const watchStartTime = watch('startTimeActual');
  const watchEndTime = watch('endTimeActual');
  const watchShiftStatus = watch('shiftStatus');

  const userType = sessionStorage.getItem('userType');

  // Validate start/end times
  useEffect(() => {
    if (watchStartDate && watchEndDate && watchStartTime && watchEndTime) {
      const startDateTime = dayjs(watchStartDate)
        .hour(dayjs(watchStartTime).hour())
        .minute(dayjs(watchStartTime).minute());

      const endDateTime = dayjs(watchEndDate)
        .hour(dayjs(watchEndTime).hour())
        .minute(dayjs(watchEndTime).minute());

      if (startDateTime.isSame(endDateTime) || startDateTime.isAfter(endDateTime)) {
        setDateError('Start time cannot be greater than or equal to end time');
      } else {
        setDateError(null);
      }
    } else {
      setDateError(null);
    }
  }, [watchStartDate, watchEndDate, watchStartTime, watchEndTime]);

  const handleDialogClose = () => {
    reset();
    setDateError(null);
    handleClose();
  };

  const handleStatusChange = (value: string) => {
    setValue('shiftStatus', value);
    setDateError(null); // Reset date error on status change

    // Merge start date and end time 
    const datePart = dayjs(initData.BookingDateTime).utc();
    const timePart = dayjs(initData.EndTime).utc();

    // Combine date and time
    const end = datePart
      .hour(timePart.hour())
      .minute(timePart.minute())
      .second(timePart.second());

    if (value === '1') { // Full Shift Completed
      // Set to booking dates and disable fields
      if (initData?.BookingDateTime && initData?.EndTime) {
        const bookingDate = dayjs(initData.BookingDateTime);
        const endTime = dayjs(initData.EndTime);

        setValue('startDateActual', dayjs(bookingDate).utc(), { shouldValidate: true });
        setValue('startTimeActual', dayjs(bookingDate).utc(), { shouldValidate: true });
        setValue('endDateActual', dayjs(bookingDate).utc(), { shouldValidate: true });
        setValue('endTimeActual', dayjs(endTime).utc(), { shouldValidate: true });
      }
    } else if (value === '2') { // Adjusted Shift Completed
      // If we have actual dates from API, use those, otherwise use booking dates
      if (initData) {
        const startDate = initData.ActualStartDateTime
          ? dayjs(initData.ActualStartDateTime).utc()
          : dayjs(initData.BookingDateTime).utc();

        const endDate = initData.ActualEndDateTime
          ? dayjs(initData.ActualEndDateTime).utc()
          : end;

        setValue('startDateActual', startDate);
        setValue('startTimeActual', startDate);
        setValue('endDateActual', endDate);
        setValue('endTimeActual', endDate);
      }
    } else if (value === '101') { // Shift Cancelled
      // Clear all date/time fields
      setValue('startDateActual', null);
      setValue('startTimeActual', null);
      setValue('endDateActual', null);
      setValue('endTimeActual', null);
    } else if (value === '0') { // Pending
      // Clear all date/time fields and disable them
      setValue('startDateActual', null);
      setValue('startTimeActual', null);
      setValue('endDateActual', null);
      setValue('endTimeActual', null);
    }
  };

  useEffect(() => {
    if (open && bookingData?.BookingID) {
      const fetchBookingData = async () => {
        setLoading(true);
        try {
          const res = await getBookingbyIDApiCall(bookingData?.BookingID);
          setInitData(res[0]);

          // Set initial form values based on existing data
          const initialValues: Partial<FormData> = {
            shiftStatus: res[0].CompletionStatus?.toString() || '0',
            notes: res[0].CarerNotes || ''
          };

          // For pending status (0), keep dates empty and disabled
          if (res[0].CompletionStatus === 0) {
            initialValues.startDateActual = null;
            initialValues.startTimeActual = null;
            initialValues.endDateActual = null;
            initialValues.endTimeActual = null;
          }
          // For full shift completed (1), use booking dates
          else if (res[0].CompletionStatus === 1) {
            initialValues.startDateActual = dayjs(res[0].BookingDateTime).utc();
            initialValues.startTimeActual = dayjs(res[0].BookingDateTime).utc();
            initialValues.endDateActual = dayjs(res[0].BookingDateTime).utc();
            initialValues.endTimeActual = dayjs(res[0].EndTime).utc();
          }
          // For adjusted shift (2) or cancelled (101), use actual dates if they exist
          else {
            initialValues.startDateActual = res[0].ActualStartDateTime
              ? dayjs(res[0].ActualStartDateTime).utc()
              : null;
            initialValues.startTimeActual = res[0].ActualStartDateTime
              ? dayjs(res[0].ActualStartDateTime).utc()
              : null;
            initialValues.endDateActual = res[0].ActualEndDateTime
              ? dayjs(res[0].ActualEndDateTime).utc()
              : null;
            initialValues.endTimeActual = res[0].ActualEndDateTime
              ? dayjs(res[0].ActualEndDateTime).utc()
              : null;
          }

          reset(initialValues as any);
        } catch (error) {
          console.error('Error fetching booking data:', error);
        } finally {
          setLoading(false);
        }
      };
      fetchBookingData();
    }
  }, [open, bookingData?.BookingID]);

  const onSubmit = async (data: FormData) => {
    try {
      if (dateError) {
        toast.error(dateError);
        return;
      }

      setIsSaving(true);

      // Combine date and time for actual start/end
      const actualStartDateTime = data.startDateActual && data.startTimeActual
        ? dayjs(data.startDateActual).format('YYYY-MM-DD') + 'T' + dayjs(data.startTimeActual).format('HH:mm:ss')
        : null;

      const actualEndDateTime = data.endDateActual && data.endTimeActual
        ? dayjs(data.endDateActual).format('YYYY-MM-DD') + 'T' + dayjs(data.endTimeActual).format('HH:mm:ss')
        : null;

      const status = parseInt(data.shiftStatus);

      if (status === 0 && data.notes.length === 0) {
        toast.error('Notes is required for pending status');
        return;
      }

      const dataToSend = {
        bookingID: bookingData?.BookingID,
        completionStatus: status,
        actualStartDateTime,
        actualEndDateTime,
        carerNotes: data.notes,
      };

      const response = await updateCompletionStatus(dataToSend);

      if (response) {
        handleDialogClose();
        fetchData();
      }
    } catch (error) {
      toast.error('Failed to update booking status');
    } finally {
      setIsSaving(false);
    }
  };

  // Determine if date/time fields should be disabled
  const isDateTimeDisabled = watchShiftStatus === '1' || watchShiftStatus === '101' || watchShiftStatus === '0';
  const isDateTimeVisible = watchShiftStatus === '1' || watchShiftStatus === '2';





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

  function GenerateNewCalendarEvent(EventDateTime, Title, Description, GuestEmails, location) {
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
    if (location) {
      Command += `&location=${location}`;
    }

    Command += "&crm=AVAILABLE&trp=false";

    window.open(Command, '_blank', 'noopener,noreferrer');
  }

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////






  const user = useSelector((state: any) => state.authReducer.carer.user);

  const handleAddToCalendar = () => {
    const eventTitle = `${bookingData.ServiceName} with ${bookingData.CarerName}`;
    const eventDescription = `${bookingData.ServiceName} for ${bookingData.Duration} Hours with ${bookingData.CarerName}`.trim();
    const bookingDate = new Date(bookingData.BookingDateTime);
    const timezoneOffset = bookingDate.getTimezoneOffset();
    const utcBookingDate = new Date(bookingDate.getTime() + (timezoneOffset * 60 * 1000));

    GenerateNewCalendarEvent(
      utcBookingDate,
      eventTitle,
      eventDescription,
      [user.emailID],
      `${bookingData.Duration} Hours`
    );
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
            Update Status
          </Typography>
          <IconButton onClick={handleDialogClose} disabled={loading}>
            <i className="ri-close-line text-2xl" />
          </IconButton>
        </DialogTitle>

        <Divider />

        <DialogContent sx={{ px: 4, py: 3 }}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Grid container spacing={6}>
              {/* Existing Booking Info Section */}
              {!bookingData.isNewBooking && (
                <Grid item xs={12}>
                  {loading ? (
                    <Skeleton animation='wave' variant="rounded" width="100%" height={280} />
                  ) : (
                    <div className="rounded-lg bg-slate-50 p-4 transition-all" style={{ backgroundColor: 'rgba(0, 128, 0, 0.05)' }}>
                      <h3 className="mb-3 font-medium text-slate-900">Client Information</h3>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div>
                          <p className="font-medium">{initData?.ClientName}</p>
                          <p className="text-sm text-slate-500">Name</p>
                        </div>
                        <div>
                          <p className="font-medium">{initData?.ClientEmailID}</p>
                          <p className="text-sm text-slate-500">Email</p>
                        </div>
                        <div>
                          <p className="font-medium">{initData?.ClientPhoneNo}</p>
                          <p className="text-sm text-slate-500">Phone</p>
                        </div>
                        <div>
                          <p className="font-medium">
                            {`${formatTimeTo(initData?.BookingDateTime?.split('T')[1])} to ${formatTimeTo(initData?.EndTime?.split('T')[1])}`}
                          </p>
                          <p className="text-sm text-slate-500">Time</p>
                        </div>
                        <div>
                          <p className="font-medium">{bookingData?.ServiceName}</p>
                          <p className="text-sm text-slate-500">Service</p>
                        </div>
                        <div>
                          <p className="font-medium">{initData?.Duration} Hours</p>
                          <p className="text-sm text-slate-500">Duration</p>
                        </div>
                        <div>
                          <p className="font-medium">{initData?.Descr ? initData.Descr : 'No description provided'}</p>
                          <p className="text-sm text-slate-500">Description</p>
                        </div>
                      </div>
                    </div>
                  )}
                </Grid>
              )}

              {/* Shift Status Selection */}
              <Grid item className="ms-3" xs={12}>
                {loading ? (
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    {[0, 1, 2, 3].map((item) => (
                      <Skeleton animation='wave' key={item} variant="rounded" width={130} height={24} />
                    ))}
                  </Box>
                ) : (
                  <Controller
                    name="shiftStatus"
                    control={control}
                    render={({ field }) => (
                      <RadioGroup
                        {...field}
                        row
                        onChange={(e) => handleStatusChange(e.target.value)}
                        sx={{
                          gap: 2,
                          '& .MuiRadio-root': { padding: 0, marginRight: 1 },
                          '& .MuiTypography-root': { fontSize: '0.875rem' }
                        }}
                      >
                        <FormControlLabel value="0" control={<Radio />} label="Pending" />
                        <FormControlLabel value="1" control={<Radio />} label="Full Shift Completed" />
                        <FormControlLabel value="2" control={<Radio />} label="Adjusted Shift Completed" />
                        <FormControlLabel value="101" control={<Radio />} label="Shift Cancelled" />
                      </RadioGroup>
                    )}
                  />
                )}

                {errors.shiftStatus && !loading && (
                  <Typography color="error" variant="caption">
                    {errors.shiftStatus.message}
                  </Typography>
                )}
              </Grid>

              {/* Date/Time Pickers */}
              {isDateTimeVisible && (
                <>
                  <Grid container spacing={4} className="ms-2.5 mt-2">
                    {['startDateActual', 'startTimeActual', 'endDateActual', 'endTimeActual'].map((fieldName) => (
                      <Grid item xs={3} key={fieldName}>
                        {loading ? (
                          <Skeleton animation='wave' variant="rounded" width="100%" height={48} />
                        ) : (
                          <Controller
                            name={fieldName}
                            control={control}
                            render={({ field }) => (
                              fieldName.includes('Date') ? (
                                <DatePicker
                                  label={fieldName.includes('start') ? 'Start Date' : 'End Date'}
                                  value={field.value}
                                  format="DD/MM/YYYY"
                                  onChange={(newValue) => {
                                    field.onChange(newValue);
                                    if (fieldName === 'startDateActual' && newValue && watchEndDate && dayjs(newValue).isAfter(watchEndDate)) {
                                      setValue('endDateActual', newValue, { shouldValidate: true });
                                    }
                                  }}
                                  disabled={isDateTimeDisabled}
                                  slotProps={{
                                    textField: {
                                      fullWidth: true,
                                      error: !!errors[fieldName],
                                      helperText: errors[fieldName]?.message
                                    }
                                  }}
                                />
                              ) : (
                                <TimePicker
                                  label={fieldName.includes('start') ? 'Start Time' : 'End Time'}
                                  value={field.value}
                                  onChange={(newValue) => {
                                    field.onChange(newValue);
                                    if (fieldName === 'startTimeActual' && watchStartDate && watchEndDate && dayjs(watchStartDate).isSame(watchEndDate) && newValue && watchEndTime && dayjs(newValue).isAfter(watchEndTime)) {
                                      setValue('endTimeActual', newValue, { shouldValidate: true });
                                    }
                                  }}
                                  disabled={isDateTimeDisabled}
                                  slotProps={{
                                    textField: {
                                      fullWidth: true,
                                      error: !!errors[fieldName],
                                      helperText: errors[fieldName]?.message
                                    }
                                  }}
                                />
                              )
                            )}
                          />
                        )}
                      </Grid>
                    ))}
                  </Grid>
                  {dateError && (
                    <Grid item xs={12} className="ms-3 pt-1 ">
                      <Typography color="error" variant="body2" className='text-error'>
                        {dateError}
                      </Typography>
                    </Grid>
                  )}
                </>
              )}

              {/* Notes Field */}
              <Grid item xs={12}>
                {loading ? (
                  <Skeleton animation='wave' variant="rounded" width="100%" height={160} />
                ) : (
                  <Controller
                    name="notes"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        multiline
                        rows={4}
                        label="Notes"
                        error={!!errors.notes}
                        helperText={errors.notes?.message}
                        required={watchShiftStatus === '0'}
                        InputProps={{
                          sx: {
                            '& textarea': {
                              resize: 'vertical',
                              overflow: 'auto',
                              minHeight: '30px'
                            }
                          }
                        }}
                      />
                    )}
                  />
                )}
              </Grid>
            </Grid>
          </LocalizationProvider>
        </DialogContent>

        <Divider />

        <DialogActions sx={{ justifyContent: 'space-between', px: 4, py: 3 }}>
          <Box className="flex items-center me-2">
            {loading ? (
              <>
                <Skeleton animation='wave' variant="rounded" width={100} height={36} sx={{ mr: 2 }} />
                {userType == '3' && (
                  <Skeleton animation='wave' variant="rounded" width={150} height={36} />
                )}
              </>
            ) : (
              <>
                <Button
                  variant='contained'
                  type="submit"
                  form="booking-form"
                  disabled={isSaving || !!dateError}
                >
                  {isSaving ? 'Saving...' : 'Save'}
                </Button>
                {userType == '3' && (
                  <Button
                    onClick={() => { handleAddToCalendar() }}
                    variant="contained"
                    color="primary"
                    sx={{ mx: 2 }}
                    startIcon={<i className="ri-calendar-line" />}
                  >
                    Add To Calendar
                  </Button>
                )}
              </>
            )}
          </Box>
          {loading ? (
            <Skeleton animation='wave' variant="rounded" width={100} height={36} />
          ) : (
            <Button variant='outlined' color='error' onClick={handleDialogClose} disabled={isSaving}>
              Cancel
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </form>
  );
};

export default EditBookingDialog;