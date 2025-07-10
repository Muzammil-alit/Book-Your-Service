import React, { useState, useEffect, useCallback } from 'react';
import dayjs from 'dayjs';

// MUI Imports
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  CircularProgress,
  IconButton,
  useMediaQuery,
  Theme,
  Skeleton
} from '@mui/material';

// Types & API
import { CarerType } from '@/types/apps/carerTypes';
import {
  getCarerOffDaysApiCall,
  updateCalendarOffDaysApiCall,
  CarerOffDayRecord
} from './action';
import { fetchCarerWeeklySchedule } from '../carers/action/carerScheduleActions';
import { CarerWeeklyScheduleItem } from '@/api/services/CarerScheduleService';

interface CalendarViewProps {
  carer: CarerType;
  onDataChange?: () => void;
}

interface OffDayDate {
  date: string;
  isWeeklyOff: boolean;
}



// Helper to expand a date range into individual dates
const expandDateRange = (dateFrom: string, dateTo: string): string[] => {
  const start = dayjs(dateFrom);
  const end = dayjs(dateTo);
  const dates = [];

  let current = start;
  while (current.isBefore(end) || current.isSame(end, 'day')) {
    dates.push(current.format('YYYY-MM-DD'));
    current = current.add(1, 'day');
  }

  return dates;
};

// Helper to format dates in DD/MM/YYYY format
const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

const CalendarView: React.FC<CalendarViewProps> = ({ carer, onDataChange, }) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [offDaysList, setOffDaysList] = useState<OffDayDate[]>([]);
  const [weeklyOffDays, setWeeklyOffDays] = useState<{ [weekday: number]: { startTime: string; endTime: string } }>({});
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [newlySelectedDates, setNewlySelectedDates] = useState<string[]>([]);
  const [pendingChanges, setPendingChanges] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [workDays, setWorkDays] = useState<Set<number>>(new Set());

  const isSmallScreen = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'));

  const months = [
    'January', 'February', 'March', 'April',
    'May', 'June', 'July', 'August',
    'September', 'October', 'November', 'December'
  ];

  // Changed weekdays order to start with Monday
  const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  useEffect(() => {
    const fetchData = async () => {
      if (carer?.CarerID) {
        setLoading(true);

        try {
          const offDaysData = await getCarerOffDaysApiCall(carer.CarerID);
          const weeklySchedule = await fetchCarerWeeklySchedule(carer.CarerID);

          const workdaysSet = new Set<number>();
          weeklySchedule.forEach((item: CarerWeeklyScheduleItem) => {
            workdaysSet.add(item.WeekDay);
          });
          setWorkDays(workdaysSet);

          const offDaysOfWeek = new Set<number>();
          for (let i = 1; i <= 7; i++) {
            if (!workdaysSet.has(i)) {
              offDaysOfWeek.add(i);
            }
          }

          const allOffDays: OffDayDate[] = [];
          const startDate = new Date(year, 0, 1);
          const endDate = new Date(year, 11, 31);

          for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
            const jsWeekday = d.getDay();
            // Convert JS weekday (0=Sun, 1=Mon, etc.) to API weekday (1=Sun, 2=Mon, etc.)
            const apiWeekday = jsWeekday === 0 ? 1 : jsWeekday + 1;
            const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

            if (offDaysOfWeek.has(apiWeekday)) {
              allOffDays.push({
                date: dateStr,
                isWeeklyOff: true
              });
            }
          }

          // Process the off days from API - handling date ranges
          const apiOffDays = offDaysData?.offDays?.flatMap((offDay: CarerOffDayRecord) => {
            const datesInRange = expandDateRange(offDay.DateFrom, offDay.DateTo);
            return datesInRange.map(date => ({
              date,
              isWeeklyOff: false
            }));
          }) || [];

          setOffDaysList([...allOffDays, ...apiOffDays]);
          setSelectedDates(apiOffDays.map((d: OffDayDate) => d.date));

        } catch (error) {
          console.error('Error fetching data:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchData();
  }, [carer, year]);

  const generateMonthCalendar = (month: number) => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const firstDayOfWeek = firstDay.getDay();

    // Adjust for Monday as first day of week (JS Sunday=0, Monday=1, etc.)
    // We want Monday (1) to be position 0, Sunday (0) to be position 6
    const firstDayPosition = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;

    const prevMonthDays = [];
    for (let i = 0; i < firstDayPosition; i++) {
      const prevMonth = month === 0 ? 11 : month - 1;
      const prevMonthYear = month === 0 ? year - 1 : year;
      const prevMonthLastDay = new Date(prevMonthYear, month, 0).getDate();
      const day = prevMonthLastDay - (firstDayPosition - 1 - i);

      const dateObj = new Date(prevMonthYear, prevMonth, day);
      const dateStr = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;

      prevMonthDays.push({
        day,
        date: dateStr,
        isPrevMonth: true
      });
    }

    const currentMonthDays = [];
    for (let day = 1; day <= daysInMonth; day++) {
      const dateObj = new Date(year, month, day);
      const dateStr = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;

      currentMonthDays.push({
        day,
        date: dateStr,
        isCurrentMonth: true
      });
    }

    const totalDaysShown = 42; // 6 weeks
    const nextMonthDays = [];
    if (totalDaysShown > prevMonthDays.length + currentMonthDays.length) {
      const daysToAdd = totalDaysShown - (prevMonthDays.length + currentMonthDays.length);
      const nextMonth = month === 11 ? 0 : month + 1;
      const nextMonthYear = month === 11 ? year + 1 : year;

      for (let day = 1; day <= daysToAdd; day++) {
        const dateObj = new Date(nextMonthYear, nextMonth, day);
        const dateStr = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;

        nextMonthDays.push({
          day,
          date: dateStr,
          isNextMonth: true
        });
      }
    }

    return [...prevMonthDays, ...currentMonthDays, ...nextMonthDays];
  };

  const isOffDay = useCallback((dateStr: string): { isOff: boolean; isWeeklyOff: boolean } => {
    const offDay = offDaysList.find(d => d.date === dateStr);
    if (offDay) {
      return { isOff: true, isWeeklyOff: offDay.isWeeklyOff };
    }
    return { isOff: false, isWeeklyOff: false };
  }, [offDaysList]);

  const isWorkDay = useCallback((dateStr: string): boolean => {
    const date = new Date(dateStr);
    const jsWeekday = date.getDay();
    // Convert JS weekday (0=Sun, 1=Mon, etc.) to API weekday (1=Sun, 2=Mon, etc.)
    const apiWeekday = jsWeekday === 0 ? 1 : jsWeekday + 1;
    return workDays.has(apiWeekday);
  }, [workDays]);

  const isOriginalSelection = useCallback((dateStr: string): boolean => {
    return selectedDates.includes(dateStr) && !newlySelectedDates.includes(dateStr);
  }, [selectedDates, newlySelectedDates]);

  const isNewlySelected = useCallback((dateStr: string): boolean => {
    return newlySelectedDates.includes(dateStr);
  }, [newlySelectedDates]);

  const handleDateClick = (dateStr: string, isWeeklyOff: boolean) => {
    if (isWeeklyOff || !isWorkDay(dateStr)) return;

    const isOriginal = selectedDates.includes(dateStr);
    const isCurrentlySelected = newlySelectedDates.includes(dateStr);

    if (isOriginal && !isCurrentlySelected) {
      setNewlySelectedDates(prev => [...prev, dateStr]);
    } else if (isCurrentlySelected) {
      setNewlySelectedDates(prev => prev.filter(d => d !== dateStr));
    } else {
      setNewlySelectedDates(prev => [...prev, dateStr]);
    }
    setPendingChanges(true);
  };

  const isSelectedForSaving = useCallback((dateStr: string): boolean => {
    const isOriginal = selectedDates.includes(dateStr) && !newlySelectedDates.includes(dateStr);
    const isNewSelection = newlySelectedDates.includes(dateStr) && !selectedDates.includes(dateStr);
    return isOriginal || isNewSelection;
  }, [selectedDates, newlySelectedDates]);

  const saveChanges = async () => {
    if (!carer?.CarerID || !pendingChanges) return;

    setSaving(true);

    try {
      const finalSelection = [];

      for (const date of selectedDates) {
        if (!newlySelectedDates.includes(date)) {
          finalSelection.push(date);
        }
      }

      for (const date of newlySelectedDates) {
        if (!selectedDates.includes(date)) {
          finalSelection.push(date);
        }
      }

      const offDays = finalSelection.filter(date => {
        const { isWeeklyOff } = isOffDay(date);
        return !isWeeklyOff && isWorkDay(date);
      });

      const success = await updateCalendarOffDaysApiCall(carer.CarerID, offDays);

      if (success) {
        setPendingChanges(false);
        setSelectedDates(offDays);
        setNewlySelectedDates([]);

        if (onDataChange) {
          onDataChange();
        }
      }
    } catch (error) {
      console.error('Error saving off days:', error);
    } finally {
      setSaving(false);
    }
  };

  const changeYear = (increment: number) => {
    setYear(prev => prev + increment);
    setNewlySelectedDates([]);
  };

  return (
    <Box>

      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'end',
        mb: 3,
        flexDirection: isSmallScreen ? 'column' : 'row',
        gap: 2,
        px: 4,
      }}>
        {/* Year Selector */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, position: 'relative', top: '5px' }}>
          <IconButton onClick={() => changeYear(-1)} aria-label="Previous year">
            <i className="ri-arrow-left-line" />
          </IconButton>

          <Typography variant="h6">{year}</Typography>

          <IconButton onClick={() => changeYear(1)} aria-label="Next year">
            <i className="ri-arrow-right-line" />
          </IconButton>
        </Box>

        {/* Legend */}
        <Box sx={{ display: 'flex', gap: 3, mb: 1, flexWrap: 'wrap', justifyContent: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 16, height: 16, borderRadius: '50%', bgcolor: 'error.light' }} />
            <Typography variant="body2">Existing Off Day</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 16, height: 16, borderRadius: '50%', bgcolor: 'success.light' }} />
            <Typography variant="body2">Newly Selected Off Day</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 16, height: 16, borderRadius: '50%', bgcolor: 'action.disabledBackground' }} />
            <Typography variant="body2">Weekly Off</Typography>
          </Box>
        </Box>

        {/* Save Changes Button or Placeholder */}
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', minWidth: 140, justifyContent: 'flex-end' }}>
          {newlySelectedDates.length > 0 ? (
            <Button
              variant="contained"
              color="primary"
              onClick={saveChanges}
              disabled={saving}
              size="small"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          ) : (
            // Placeholder to preserve space
            <Box sx={{ height: 36, minWidth: 16 }} />
          )}
        </Box>
      </Box>



      {loading ? (
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2, p: 4 }} >
          {Array.from({ length: 12 }).map((_, index) => (
            <Skeleton
              key={index}
              variant="rectangular"
              width="100%"
              height={200}
              animation="wave"
              sx={{ borderRadius: 2, p: 6 }}
            />
          ))}
        </Box>
      ) : (
        <Grid container spacing={2} className='px-4 pb-4'>
          {months.map((month, monthIndex) => (
            <Grid item xs={12} md={6} lg={3} key={month}>
              <Paper
                sx={{
                  p: 2,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  '&:hover': {
                    boxShadow: 3
                  },
                  borderRadius: 2,
                  overflow: 'hidden',
                  boxShadow: 2
                }}
              >
                <Typography
                  variant="h6"
                  align="center"
                  sx={{
                    mb: 2,
                    color: 'primary.main',
                    fontWeight: 600,
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    pb: 1
                  }}
                >
                  {month}
                </Typography>

                <Grid container sx={{ flexGrow: 1 }}>
                  {weekdays.map(day => (
                    <Grid item xs={12 / 7} key={day}>
                      <Typography
                        align="center"
                        sx={{
                          fontWeight: 600,
                          fontSize: '0.75rem',
                          py: 0.5,
                          color: 'text.secondary',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px'
                        }}
                      >
                        {day}
                      </Typography>
                    </Grid>
                  ))}

                  {generateMonthCalendar(monthIndex).map((day, i) => {
                    const { isOff, isWeeklyOff } = isOffDay(day.date);
                    const isWorkDayDate = isWorkDay(day.date);
                    const isDisabled = !isWorkDayDate;

                    const isNewSelection = isNewlySelected(day.date);
                    const isOriginal = selectedDates.includes(day.date) && !newlySelectedDates.includes(day.date);
                    const isNewAddition = newlySelectedDates.includes(day.date) && !selectedDates.includes(day.date);

                    let bgColor = 'transparent';
                    let textColor = day.isCurrentMonth ? 'text.primary' : 'text.disabled';
                    let borderStyle = '1px solid transparent';

                    if (isDisabled) {
                      bgColor = 'action.disabledBackground';
                      textColor = 'text.disabled';
                    } else if (isOriginal) {
                      bgColor = 'error.light';
                      textColor = 'error.contrastText';
                    } else if (isNewAddition) {
                      bgColor = 'success.light';
                      textColor = 'success.contrastText';
                      borderStyle = '1px solid #4caf50';
                    } else {
                      bgColor = 'transparent';
                      textColor = day.isCurrentMonth ? 'text.primary' : 'text.disabled';
                    }

                    return (
                      <Grid item xs={12 / 7} key={i} sx={{ mb: 1.5 }}>
                        <Box
                          sx={{
                            p: 1,
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            cursor: isDisabled ? 'not-allowed' : 'pointer',
                            borderRadius: '50%',
                            userSelect: 'none',
                            height: '32px',
                            width: '32px',
                            color: textColor,
                            bgcolor: bgColor,
                            border: borderStyle,
                            opacity: day.isCurrentMonth ? 1 : 0.5,
                            transition: 'all 0.2s ease',
                            mx: 'auto',
                            '&:hover': {
                              bgcolor: isDisabled
                                ? 'action.disabledBackground'
                                : isOriginal
                                  ? 'error.main'
                                  : isNewAddition
                                    ? 'success.main'
                                    : 'action.hover',
                              transform: isDisabled ? 'none' : 'scale(1.1)'
                            },
                            '&:focus-visible': {
                              outline: '2px solid blue',
                              outlineOffset: '2px'
                            }
                          }}
                          onClick={() => handleDateClick(day.date, isWeeklyOff)}
                          role="button"
                          tabIndex={day.isCurrentMonth ? 0 : -1}
                          aria-label={`${day.day} ${months[monthIndex]} ${year}, ${isDisabled
                            ? 'Non-work day'
                            : isOriginal && isNewSelection
                              ? 'Deselected off day'
                              : isOriginal
                                ? 'Selected off day'
                                : isNewSelection
                                  ? 'Newly selected off day'
                                  : 'Available work day'
                            }`}
                          aria-selected={isOriginal && !isNewSelection || isNewSelection && !selectedDates.includes(day.date)}
                          aria-disabled={isDisabled}
                          data-date={day.date}
                          data-state={
                            isOriginal && isNewSelection
                              ? 'deselected'
                              : isOriginal
                                ? 'original'
                                : isNewSelection
                                  ? 'new'
                                  : 'none'
                          }
                        >
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: (isOff || isOriginal) && !(isOriginal && isNewSelection) ? 'normal' : 'normal',
                              color: textColor
                            }}
                          >
                            {day.day}
                          </Typography>
                        </Box>
                      </Grid>
                    );
                  })}
                </Grid>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default CalendarView;