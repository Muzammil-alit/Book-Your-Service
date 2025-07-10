import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
  Typography,
  Checkbox,
  Box,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  TableContainer
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { TimePicker } from '@mui/x-date-pickers';
import dayjs, { Dayjs } from 'dayjs';
import { toast } from 'react-toastify';
import { CarerType } from '@/types/apps/carerTypes';
import { fetchCarerWeeklySchedule, saveCarerWeeklySchedule } from './action/carerScheduleActions';
import { CarerWeeklyScheduleItem } from '@/api/services/CarerScheduleService';
import utc from 'dayjs/plugin/utc';

type WeeklyScheduleItem = {
  weekday: number;
  startTime: Dayjs | null;
  endTime: Dayjs | null;
  enabled: boolean;
  error?: string;
};

type WeeklyOffModalProps = {
  open: boolean;
  onClose: () => void;
  carer: CarerType | null;
};

const WEEKDAYS = [
  { name: 'Monday', value: 2 },
  { name: 'Tuesday', value: 3 },
  { name: 'Wednesday', value: 4 },
  { name: 'Thursday', value: 5 },
  { name: 'Friday', value: 6 },
  { name: 'Saturday', value: 7 },
  { name: 'Sunday', value: 1 },
];

const defaultStartTime = dayjs().hour(5).minute(0).second(0);
const defaultEndTime = dayjs().hour(18).minute(0).second(0);

const WeeklyOffModal = ({ open, onClose, carer }: WeeklyOffModalProps) => {
  const [schedule, setSchedule] = useState<WeeklyScheduleItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [hasErrors, setHasErrors] = useState<boolean>(false);

  dayjs.extend(utc);

  useEffect(() => {
    if (open && carer?.CarerID) {
      loadCarerSchedule(carer.CarerID);
    } else if (open) {
      initializeDefaultSchedule();
    }
  }, [open, carer]);

  const initializeDefaultSchedule = () => {
    const initialSchedule = WEEKDAYS.map(day => ({
      weekday: day.value,
      startTime: defaultStartTime,
      endTime: defaultEndTime,
      enabled: true,
      error: undefined
    }));
    setSchedule(initialSchedule);
    setHasErrors(false);
  };

  const loadCarerSchedule = async (carerID: number) => {
    setLoading(true);
    try {
      const initialSchedule = WEEKDAYS.map(day => ({
        weekday: day.value,
        startTime: defaultStartTime,
        endTime: defaultEndTime,
        enabled: false,
        error: undefined
      }));

      const scheduleData = await fetchCarerWeeklySchedule(carerID);
      
      if (scheduleData.length > 0) {
        scheduleData.forEach(item => {
          const index = initialSchedule.findIndex(s => s.weekday === item.WeekDay);
          if (index !== -1) {
            initialSchedule[index].enabled = true;
            initialSchedule[index].startTime = dayjs(item.StartTime).utc();
            initialSchedule[index].endTime = dayjs(item.EndTime).utc();
          }
        });
      }

      setSchedule(initialSchedule);
      setHasErrors(false);
    } catch (error) {
      console.error('Error loading carer schedule:', error);
      toast.error('Failed to load carer schedule');
    } finally {
      setLoading(false);
    }
  };

  const validateSchedule = (scheduleToValidate: WeeklyScheduleItem[]) => {
    let errorsFound = false;
    const validatedSchedule = scheduleToValidate.map(item => {
      if (item.enabled) {
        if (!item.startTime || !item.endTime) {
          errorsFound = true;
          return { ...item, error: 'Both start and end time are required' };
        }
        if (item.startTime.isAfter(item.endTime) || item.startTime.isSame(item.endTime)) {
          errorsFound = true;
          return { ...item, error: 'Start time must be before end time' };
        }
      }
      return { ...item, error: undefined };
    });
    setHasErrors(errorsFound);
    return validatedSchedule;
  };

  const handleClose = () => {
    onClose();
  };

  const handleToggleDay = (weekday: number) => {
    setSchedule(prevSchedule => {
      const updatedSchedule = prevSchedule.map(item =>
        item.weekday === weekday
          ? { ...item, enabled: !item.enabled, error: undefined }
          : item
      );
      return validateSchedule(updatedSchedule);
    });
  };

  const handleStartTimeChange = (weekday: number, newTime: Dayjs | null) => {
    setSchedule(prevSchedule => {
      const updatedSchedule = prevSchedule.map(item =>
        item.weekday === weekday 
          ? { ...item, startTime: newTime, error: undefined } 
          : item
      );
      return validateSchedule(updatedSchedule);
    });
  };

  const handleEndTimeChange = (weekday: number, newTime: Dayjs | null) => {
    setSchedule(prevSchedule => {
      const updatedSchedule = prevSchedule.map(item =>
        item.weekday === weekday 
          ? { ...item, endTime: newTime, error: undefined } 
          : item
      );
      return validateSchedule(updatedSchedule);
    });
  };

  const handleSave = async () => {
    const validatedSchedule = validateSchedule(schedule);
    setSchedule(validatedSchedule);

    if (!hasErrors && carer?.CarerID) {
      setSaving(true);
      try {
        const scheduleData: CarerWeeklyScheduleItem[] = validatedSchedule
          .filter(item => item.enabled)
          .map(item => ({
            weekday: item.weekday,
            startTime: item.startTime?.format('HH:mm:ss') || '',
            endTime: item.endTime?.format('HH:mm:ss') || ''
          }));

        const success = await saveCarerWeeklySchedule(carer.CarerID, scheduleData);
        if (success) {
          onClose();
        }
      } catch (error) {
        console.error('Error saving carer schedule:', error);
        toast.error('Failed to save schedule');
      } finally {
        setSaving(false);
      }
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        <Typography variant="h6">
          {carer ? `${carer.CarerName}'s Weekly Schedule` : 'Configure Weekly Working Days'}
        </Typography>
      </DialogTitle>
      <DialogContent>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer component={Paper} sx={{ mt: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell width="10%">Working Day</TableCell>
                  <TableCell width="25%">Weekday</TableCell>
                  <TableCell width="30%">Start Time</TableCell>
                  <TableCell width="30%">End Time</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {schedule.map((day) => (
                  <React.Fragment key={day.weekday}>
                    <TableRow>
                      <TableCell>
                        <Checkbox
                          checked={day.enabled}
                          onChange={() => handleToggleDay(day.weekday)}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography>{WEEKDAYS.find(d => d.value === day.weekday)?.name}</Typography>
                      </TableCell>
                      <TableCell>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                          <TimePicker
                            value={day.startTime}
                            onChange={(newValue) => handleStartTimeChange(day.weekday, newValue)}
                            disabled={!day.enabled}
                            ampm
                            minutesStep={5}
                            slotProps={{
                              textField: {
                                fullWidth: true,
                                size: 'small',
                                error: !!day.error
                              }
                            }}
                          />
                        </LocalizationProvider>
                      </TableCell>
                      <TableCell>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                          <TimePicker
                            value={day.endTime}
                            onChange={(newValue) => handleEndTimeChange(day.weekday, newValue)}
                            disabled={!day.enabled}
                            ampm
                            minutesStep={5}
                            slotProps={{
                              textField: {
                                fullWidth: true,
                                size: 'small',
                                error: !!day.error
                              }
                            }}
                          />
                        </LocalizationProvider>
                      </TableCell>
                    </TableRow>
                    {day.error && (
                      <TableRow>
                        <TableCell colSpan={4} sx={{  paddingTop: 2, paddingBottom: 2, paddingLeft: 6 }}>
                          <Typography variant="body2" sx={{ color: 'red' }}>
                            {day.error}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DialogContent>
      <DialogActions className='flex items-center justify-between mt-4'>
        <Button
          type='submit'
          onClick={handleSave}
          variant="contained"
          color="primary"
          disabled={loading || saving || hasErrors}
          startIcon={saving ? <CircularProgress size={20} /> : null}
        >
          Save
        </Button>
        <Button variant='outlined' color='error' onClick={onClose} disabled={loading || saving}>
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default WeeklyOffModal;