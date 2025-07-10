import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
  Box
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { CarerType } from '@/types/apps/carerTypes';
import {
  CarerOffDayRecord,
  updateCarerOffDayByIdApiCall,
  createCarerOffDayApiCall
} from './action';
import { fetchCarerWeeklySchedule } from '../carers/action/carerScheduleActions';
import { CarerWeeklyScheduleItem } from '@/api/services/CarerScheduleService';

import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'

interface EditOffDaysModalProps {
  open: boolean;
  onClose: () => void;
  record: CarerOffDayRecord | null;
  carer: CarerType;
  refreshData: () => void;
  isNewRecord?: boolean;
}

const EditOffDaysModal: React.FC<EditOffDaysModalProps> = ({
  open,
  onClose,
  record,
  carer,
  refreshData,
  isNewRecord = false
}) => {

    


  const [dateFrom, setDateFrom] = useState<any>(null)
  const [dateTo, setDateTo] = useState<any>(null)


  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [weeklyOffDays, setWeeklyOffDays] = useState<{ [weekday: number]: boolean }>({});
  const [fetchingSchedule, setFetchingSchedule] = useState<boolean>(false);

  // Reset dates when modal opens
  useEffect(() => {
    if (open) {
      if (record) {
        setDateFrom(dayjs(record.DateFrom));
        setDateTo(dayjs(record.DateTo));
      }
      setError(null);
    }
  }, [open, record, isNewRecord]);

  // Map JavaScript day numbers to day names for clarity
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  // Fetch carer's weekly schedule when modal opens
  useEffect(() => {
    if (open && carer?.CarerID) {
      fetchCarerSchedule();
    }
  }, [open, carer]);
  
    
    

  // Fetch the carer's weekly schedule
  const fetchCarerSchedule = async () => {
    if (!carer?.CarerID) return;

    setFetchingSchedule(true);

    try {
      const weeklySchedule = await fetchCarerWeeklySchedule(carer.CarerID);

      // Process the weekly schedule to track which days are work days
      const workDaysMap: { [weekday: number]: boolean } = {};

      // Store which days of week are work days
      weeklySchedule.forEach((item: CarerWeeklyScheduleItem) => {
        // API uses 0-6 (0=Monday, ..., 6=Sunday)
        workDaysMap[item.WeekDay] = true;
      });




      setWeeklyOffDays(workDaysMap);
    } catch (error) {
      console.error('Error fetching weekly schedule:', error);
    } finally {
      setFetchingSchedule(false);
    }
  };

  // Function to check if a date should be disabled (if it's a weekly off day)
  const shouldDisableDate = (date: dayjs.Dayjs) => {
      
    if (Object.keys(weeklyOffDays).length === 0) return false;

    // Get JavaScript day of week (0=Sunday, 1=Monday, ..., 6=Saturday)
    const jsWeekday = date.day();

    // Convert to the format used by the API (0=Monday, ..., 6=Sunday)
    // If JavaScript day is 0 (Sunday), it's 6 in API format
    // Otherwise, subtract 1 from JS day to get API day
    const apiWeekday = jsWeekday === 0 ? 6 : jsWeekday - 1;

    // Return true if this is NOT a work day (meaning it's an off day)
    return weeklyOffDays[apiWeekday] !== true;
  };

  const handleSave = async () => {
    // Validate dates
    if (!dateFrom || !dateTo) {
      setError('Both dates are required');
      return;
    }

    if (dateFrom.isAfter(dateTo)) {
      setError('Start date cannot be after end date');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Format dates consistently
      const formattedDateFrom = dateFrom.format('YYYY-MM-DD');
      const formattedDateTo = dateTo.format('YYYY-MM-DD');

      let success = false;

      // If this is an existing record being edited, use the updateCarerOffDayById API
      if (!isNewRecord && record?.CarerOffDayID) {
        success = await updateCarerOffDayByIdApiCall(
          carer.CarerID!,
          record.CarerOffDayID,
          formattedDateFrom,
          formattedDateTo
        );
      } else {
        // For new records, use the createCarerOffDayApiCall with dateFrom/dateTo approach
        success = await createCarerOffDayApiCall(
          carer.CarerID!,
          formattedDateFrom,
          formattedDateTo
        );
      }

      if (success) {
        refreshData();
        onClose();
      }
    } catch (err) {
      setError('Failed to update off days.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    onClose()
    setDateFrom(null);
    setDateTo(null);  
    setError(null);
    setWeeklyOffDays({});
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">



      <DialogTitle className='flex items-center justify-between px-6 pb-2 pt-4'>
        <Typography variant='h5'>{isNewRecord ? 'Add Off Days' : 'Edit Off Days'}</Typography>
        <IconButton size='small' onClick={handleClose}>
          <i className='ri-close-line text-2xl' />
        </IconButton>
      </DialogTitle>
      <Divider />



      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, py: 2 }}>

          <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="en-gb">
            <DatePicker
              className='mb-4'
              label="From Date"
              value={dateFrom}
              onChange={(newValue) => {
                setDateFrom(newValue || dayjs());
                setError(null);
              }}
              format="DD/MM/YYYY"
              shouldDisableDate={shouldDisableDate}
              maxDate={dateTo || undefined}
              slotProps={{
                textField: {
                  fullWidth: true,
                  error: !!error && !dateFrom,
                  helperText: (!dateFrom && error) ? 'Start date is required' : undefined
                }
              }}
            />

            <DatePicker
              label="To Date"
              value={dateTo}
              onChange={(newValue) => {
                setDateTo(newValue || dayjs());
                setError(null);
              }}
              format="DD/MM/YYYY"
              shouldDisableDate={shouldDisableDate}
              minDate={dateFrom || undefined}
              slotProps={{
                textField: {
                  fullWidth: true,
                  error: !!error && (!dateTo || (dateFrom && dateTo && dateFrom.isAfter(dateTo))),
                  helperText: error && (!dateTo || (dateFrom && dateTo && dateFrom.isAfter(dateTo)))
                    ? !dateTo
                      ? 'End date is required'
                      : 'End date must be after start date'
                    : undefined
                }
              }}
            />
          </LocalizationProvider>

          {error && !error.includes('required') && !error.includes('after') && (
            <Box sx={{ color: 'error.main', mt: 1 }}>
              {error}
            </Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions className='flex items-center justify-between mt-4'>

        <Button
          type='submit'
          onClick={handleSave}
          variant="contained"
          color="primary"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : null}>
          Save
        </Button>
        <Button variant='outlined' color='error' onClick={onClose} disabled={loading}>
          Cancel
        </Button>




      </DialogActions>
    </Dialog>
  );
};

export default EditOffDaysModal; 