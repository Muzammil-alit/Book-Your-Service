'use client'

import { useEffect, useRef, useState } from 'react'
import { duration, useTheme } from '@mui/material/styles'
import {
  MenuItem,
  Button,
  Select,
  Box,
} from '@mui/material'
import FullCalendar from '@fullcalendar/react'
import listPlugin from '@fullcalendar/list'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import type { CalendarOptions } from '@fullcalendar/core'

import EditBookingDialog from '../EditBooking'

import 'bootstrap-icons/font/bootstrap-icons.css'
import { toast } from 'react-toastify'

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { getAdminCalendar, getClientListApiCall } from './action'
import { formatTimeTo, GetFormattedDateWithYearFormat } from '@/utils/commonFunction'
import { useSelector } from 'react-redux'

dayjs.extend(utc);
dayjs.extend(timezone);


export function transformToConfirmedBookingEvents(carers: any[]) {
  // Helper function to format time in 12-hour format consistently
  const formatTimeRange12Hour = (startDate: Date, endDate: Date): string => {
    const formatTime = (date: Date) => {
      let hours = date.getHours();
      const minutes = date.getMinutes();
      const ampm = hours >= 12 ? 'PM' : 'AM';

      // Convert to 12-hour format
      hours = hours % 12;
      hours = hours ? hours : 12; // Convert 0 to 12

      // Include minutes only if they're not 00
      return minutes === 0
        ? `${hours} ${ampm}`
        : `${hours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
    };

    const startTime = formatTime(startDate);
    const endTime = formatTime(endDate);

    // If both times have the same AM/PM, remove the second one
    const startAmPm = startTime.includes('AM') ? 'AM' : 'PM';
    const endAmPm = endTime.includes('AM') ? 'AM' : 'PM';

    if (startAmPm === endAmPm) {
      return `${startTime.replace(` ${startAmPm}`, '')} - ${endTime}`;
    }

    return `${startTime} - ${endTime}`;
  };

  const events: any[] = [];

  carers?.forEach(carer => {
    const carerColor = carer.Color || '#b8e986';
    const carerName = carer.CarerName;

    // Process Bookings - only include confirmed ones
    const bookings = Array.isArray(carer.Bookings[0])
      ? carer.Bookings.flat()
      : carer.Bookings;

    bookings.forEach(booking => {
      // Only include confirmed bookings (status not 101 or 0)
      if (booking.BookingStatus === 101 || booking.BookingStatus === 0) return;

      const bDateTimeValue = booking.BookingDateTime.split('T');
      const bStartDateValue = bDateTimeValue[0];
      const bStartTimeValue = formatTimeTo(bDateTimeValue[1]);
      const bStartDateTime = new Date(GetFormattedDateWithYearFormat(bStartDateValue) + ' ' + bStartTimeValue);

      const bEndDateTimeValue = booking.EndTime.split('T');
      const bEndTimeValue = formatTimeTo(bEndDateTimeValue[1]);
      const bEndDateTime = new Date(GetFormattedDateWithYearFormat(bStartDateValue) + ' ' + bEndTimeValue);

      // Use the consistent time formatting
      const timeRange = formatTimeRange12Hour(bStartDateTime, bEndDateTime);
      const title = `${timeRange} ${booking.ClientName.split(' ')[0]} w/ ${carerName.split(' ')[0]}`;

      events.push({
        title,
        start: bStartDateTime,
        end: bEndDateTime,
        allDay: false,
        backgroundColor: carerColor,
        extendedProps: {
          type: 'booking',
          completionStatus: booking.CompletionStatus,
          status: booking.BookingStatus,
          bookingId: booking.BookingID,
          carerName,
          clientName: booking.ClientName,
          serviceName: booking.ServiceName,
          duration: booking.Duration
        }
      });
    });
  });

  return events;
}

const Calendar = () => {
  const calendarRef = useRef<FullCalendar>(null);
  const [bookings, setBookings] = useState([]);
  const [editModal, setEditModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const theme = useTheme();
  const [currentView, setCurrentView] = useState('dayGridMonth');
  const [selectedCarer, setSelectedCarer] = useState('all');
  const [uniqueCarers, setUniqueCarers] = useState<{ CarerID: string, CarerName: string }[]>([]);
  const [events, setEvents] = useState([]);
  const [rangeStart, setRangeStart] = useState('');
  const [rangeEnd, setRangeEnd] = useState('');
  const today = dayjs().format('YYYY-MM-DD');
  const [loading, setLoading] = useState(false)

  // Responsive state
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);



  // Check screen size
  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);

      // Update calendar size when screen changes
      if (calendarRef.current) {
        setTimeout(() => {
          calendarRef.current?.getApi().updateSize();
        }, 300);
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    window.addEventListener('orientationchange', checkScreenSize);

    return () => {
      window.removeEventListener('resize', checkScreenSize);
      window.removeEventListener('orientationchange', checkScreenSize);
    };
  }, []);









  // Month and year selection
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const currentYear = dayjs().year();
  const years = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);

  const [selectedMonth, setSelectedMonth] = useState(dayjs().month());
  const [selectedYear, setSelectedYear] = useState(currentYear);




  const carerID = useSelector((state: any) => state.authReducer.carer.user?.carerID);

  useEffect(() => {
    const fetchInitialData = async () => {
      const currentMonth = dayjs().month();
      const currentYear = dayjs().year();
      const start = dayjs().year(currentYear).month(currentMonth).startOf('month').format('YYYY-MM-DD');
      const end = dayjs().year(currentYear).month(currentMonth).endOf('month').format('YYYY-MM-DD');

      setRangeStart(start);
      setRangeEnd(end);

      try {
        setLoading(true)
        const apiBookings = await getAdminCalendar(carerID, start, end);
        setBookings(apiBookings as any);

        const carersMap = new Map();
        apiBookings?.forEach((booking: any) => {
          if (!carersMap?.has(booking.CarerID)) {
            carersMap.set(booking.CarerID, {
              CarerID: booking.CarerID,
              CarerName: booking.CarerName
            });
          }
        });
        setUniqueCarers(Array.from(carersMap.values()));
      }
      catch (error) {

      }
      finally {
        setLoading(false)
      }
    }
    fetchInitialData();
  }, []);

  const fetchBookings = async (
    startDate: string | null = rangeStart,
    endDate: string | null = rangeEnd,
    carerId: string | null = selectedCarer === 'all' ? null : selectedCarer
  ) => {
    try {
      const effectiveStartDate = startDate || dayjs().startOf('month').format('YYYY-MM-DD');
      const effectiveEndDate = endDate || dayjs().endOf('month').format('YYYY-MM-DD');

      const apiBookings = await getAdminCalendar(carerID, effectiveStartDate, effectiveEndDate);
      setBookings(apiBookings as any);

      if (!startDate) setRangeStart(effectiveStartDate);
      if (!endDate) setRangeEnd(effectiveEndDate);
    } catch (error) {
      toast.error('Failed to fetch bookings');
    }
    
      finally {
        setLoading(false)
      }
  };

  useEffect(() => {
    setEvents(transformToConfirmedBookingEvents(bookings));
  }, [bookings]);

  const handleDatesSet = (dateInfo: any) => {
    setLoading(true);
    const viewType = dateInfo.view.type;
    setCurrentView(viewType);

    let start, end;
    if (viewType === 'dayGridMonth') {
      const firstVisibleDate = dateInfo.start;
      start = dayjs(firstVisibleDate).startOf('month').format('YYYY-MM-DD');
      end = dayjs(firstVisibleDate).endOf('month').format('YYYY-MM-DD');
    } else {
      start = dayjs(dateInfo.start).format('YYYY-MM-DD');
      end = dayjs(dateInfo.end).format('YYYY-MM-DD');
    }

    setRangeStart(start);
    setRangeEnd(end);
    fetchBookings(start, end, selectedCarer === 'all' ? null : selectedCarer);
  };

  const handleEditConfirm = () => {
    setEditModal(false);
    fetchBookings();
  };

  const handleEventClick = (clickInfo: any) => {
    const event = clickInfo.event;
    const eventData = event.extendedProps;

    if (eventData.type) {
      const bookingData = {
        isNewBooking: false,
        BookingID: eventData.bookingId,
        CarerName: eventData.carerName,
        BookingDateTime: event.start ? dayjs(event.start).format('YYYY-MM-DDTHH:mm:ss') : null,

        ServiceName: eventData.serviceName,
        Duration: eventData.duration,
      };

      setSelectedBooking(bookingData);
      setEditModal(true);
      clickInfo.jsEvent.preventDefault();
    }
  };

  // Handle month change
  const handleMonthChange = (e: any) => {
    const month = e.target.value as number;
    setSelectedMonth(month);

    // Create a date for the first day of the selected month
    const targetDate = dayjs().year(selectedYear).month(month).date(1);

    // Update the calendar view
    if (calendarRef.current) {
      const calendarApi = calendarRef.current.getApi();
      calendarApi.gotoDate(targetDate.toDate());

      // For month view, ensure we're using the whole month boundaries
      if (currentView === 'dayGridMonth') {
        const start = targetDate.startOf('month').format('YYYY-MM-DD');
        const end = targetDate.endOf('month').format('YYYY-MM-DD');
        fetchBookings(start, end, selectedCarer === 'all' ? null : selectedCarer);
      }
    }
  };

  // Handle year change
  const handleYearChange = (e: any) => {
    const year = e.target.value as number;
    setSelectedYear(year);

    // Create a date for the first day of the selected month in the selected year
    const targetDate = dayjs().year(year).month(selectedMonth).date(1);

    // Update the calendar view
    if (calendarRef.current) {
      const calendarApi = calendarRef.current.getApi();
      calendarApi.gotoDate(targetDate.toDate());

      // For month view, ensure we're using the whole month boundaries
      if (currentView === 'dayGridMonth') {
        const start = targetDate.startOf('month').format('YYYY-MM-DD');
        const end = targetDate.endOf('month').format('YYYY-MM-DD');
        fetchBookings(start, end, selectedCarer === 'all' ? null : selectedCarer);
      }
    }
  };





  const generateSkeletonEvents = () => {
    const skeletonEvents = [];
    const currentYear = dayjs().year(); // Get current year
    const daysInMonth = dayjs().month(selectedMonth).daysInMonth(); // Number of days in selected month

    // Generate for all days in the month
    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = dayjs()
        .year(currentYear)
        .month(selectedMonth)
        .date(day);


      // Add 1-3 skeleton events per day
      const eventCount = 3

      for (let j = 0; j < eventCount; j++) {
        const hour = Math.floor(Math.random() * 8) + 9; // 9am-5pm
        const duration = Math.floor(Math.random() * 3) + 1; // 1-3 hours

        skeletonEvents.push({
          id: `skeleton-${selectedMonth}-${day}-${j}`,
          title: ' ',
          start: currentDate.set('hour', hour).toDate(),
          end: currentDate.set('hour', hour + duration).toDate(),
          backgroundColor: '#e0e0e0',
          borderColor: '#bdbdbd',
          extendedProps: {
            type: 'skeleton',
            loading: true
          },
          display: 'block'
        });
      }
    }

    return skeletonEvents;
  };




  const calendarOptions: CalendarOptions = {

    events: loading ? generateSkeletonEvents() : events,
    displayEventTime: false,
    initialDate: today,
    eventOverlap: false,
    eventDisplay: 'block',
    fixedWeekCount: false,
    showNonCurrentDates: false,
    firstDay: 1,
    navLinks: false,
    dayMaxEvents: 3,
    datesSet: handleDatesSet,
    plugins: [interactionPlugin, dayGridPlugin, timeGridPlugin, listPlugin],
    initialView: 'dayGridMonth',

    headerToolbar: {
      start: '',
      end: ' '
    },


    eventDidMount({ event, el }: any) {


      if (loading) {
        // For skeleton events
        el.style.setProperty('background-color', 'gray', 'important');
        el.style.setProperty('opacity', '0.3', 'important');
        el.style.setProperty('color', 'transparent', 'important');
        el.style.setProperty('border', 'none', 'important');
        el.style.setProperty('cursor', 'default', 'important');
        el.style.setProperty('height', '24px', 'important');

        // Create shimmer effect
        const shimmer = document.createElement('div');
        shimmer.style.position = 'absolute';
        shimmer.style.top = '0';
        shimmer.style.left = '0';
        shimmer.style.width = '100%';
        shimmer.style.height = '100%';
        shimmer.style.background = 'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)';
        shimmer.style.animation = 'shimmer 1.5s infinite';

        // Add animation keyframes
        const style = document.createElement('style');
        style.textContent = `
      @keyframes shimmer {
        0% { transform: translateX(-100%); }
        100% { transform: translateX(100%); }
      }
    `;
        document.head.appendChild(style);

        el.appendChild(shimmer);
        return;
      }







      const bgColor = event.backgroundColor || '';
      const textColor = '#FFFFFF';

      el.style.setProperty('background-color', bgColor, 'important');
      el.style.setProperty('color', textColor, 'important');
      el.style.setProperty('cursor', 'pointer', 'important');

      const innerElements = el.querySelectorAll('.fc-event-main, .fc-event-title');
      innerElements.forEach((innerEl: HTMLElement) => {
        innerEl.style.setProperty('color', textColor, 'important');
      });

      const dotEl = el.querySelector('.fc-daygrid-event-dot');
      if (dotEl) {
        dotEl.style.setProperty('display', 'none', 'important');
      }

      el.setAttribute('title', event.title);




      const titleEl = el.querySelector('.fc-event-title');
      if (titleEl) {
        // Clear any existing icons first
        const existingIcons = el.querySelectorAll('.status-icon');
        existingIcons.forEach(icon => icon.remove());

        // Create icon element
        const icon = document.createElement('span');
        icon.className = 'status-icon'; // Add this class
        icon.style.marginRight = '4px'; // Add some spacing
        icon.style.display = 'inline-flex'; // Ensures proper alignment

        const status = event.extendedProps.completionStatus

        // Set icon based on status (using BookingStatus consistently)
        if (status === 1) { // Full shift completed
          icon.innerHTML = `
  <svg xmlns="http://www.w3.org/2000/svg"
       width="16" height="16"
       viewBox="0 0 16 16"
       style="position: relative; right: 2px; vertical-align: middle; display: inline-block; line-height: 1;">
    <circle cx="8" cy="8" r="8" fill="green" />
    <path fill="white" d="M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.992 4.99a.75.75 0 0 1-1.08.02L5.324 9.384a.75.75 0 1 1 1.06-1.06l1.094 1.093 3.493-4.425z"/>
  </svg>`;
        }
        else if (status === 2) { // Adjusted shift completed
          icon.innerHTML = `
<svg xmlns="http://www.w3.org/2000/svg"
     width="16" height="16"
     viewBox="0 0 16 16"
     style="position: relative; right: 2px; vertical-align: middle; display: inline-block; line-height: 1;">
  <circle cx="8" cy="8" r="8" fill="#26C6F9" />
  <path fill="white" d="M11.2 4.8a4.5 4.5 0 1 0 .3 6.4.75.75 0 0 0-1-1.1 3 3 0 1 1-.2-4.3H9a.75.75 0 0 0 0 1.5h3.25a.25.25 0 0 0 .25-.25V4.25a.75.75 0 1 0-1.5 0v.55z"/>
</svg>
`;
        }

        else if (status === 0) { // Pending
          icon.innerHTML = `
<svg xmlns="http://www.w3.org/2000/svg"
     width="16" height="16"
     viewBox="0 0 16 16"
     style="position: relative; right: 2px; vertical-align: middle; display: inline-block; line-height: 1;">
  <circle cx="8" cy="8" r="8" fill="#facc15" />
  <path fill="white" d="M8 3a.75.75 0 0 1 .75.75v4.25l2.5 1.5a.75.75 0 1 1-.75 1.3L7.25 9.1V3.75A.75.75 0 0 1 8 3z"/>
</svg>`;
        }
        else if (status === 101) { // Cancelled
          icon.innerHTML = `
<svg xmlns="http://www.w3.org/2000/svg"
     width="16" height="16"
     viewBox="0 0 16 16"
     style="position: relative; right: 2px; vertical-align: middle; display: inline-block; line-height: 1;">
  <circle cx="8" cy="8" r="8" fill="#ef4444" />
  <line x1="5" y1="5" x2="11" y2="11" stroke="white" stroke-width="1.5" stroke-linecap="round" />
  <line x1="11" y1="5" x2="5" y2="11" stroke="white" stroke-width="1.5" stroke-linecap="round" />
</svg>`;
        }

        // Insert the icon before the title
        titleEl.parentNode.insertBefore(icon, titleEl);
      }



    },
    eventClick: handleEventClick,
    direction: theme.direction
  };




  return (
    <><Box
      display="flex"
      sx={{ flexWrap: 'wrap' }}
      flexDirection={isMobile ? 'column' : 'row'}
      alignItems={isMobile ? 'stretch' : 'end'}
      justifyContent="space-between"
      gap={2}
      mb={2}
    >
      {/* Left: Filters - stacked on mobile */}
      <Box
        display="flex"
        flexDirection={isMobile ? 'column' : 'row'}
        alignItems={isMobile ? 'stretch' : 'end'}
        gap={2}
        width={isMobile ? '100%' : undefined}
      >
        <Select
          labelId="month-label"
          value={selectedMonth}
          onChange={handleMonthChange}
          displayEmpty
          sx={{ width: 200 }}
          size='small'
        >
          {months?.map((month, index) => (
            <MenuItem key={month} value={index}>
              {month}
            </MenuItem>
          ))}
        </Select>

        <Select
          labelId="year-label"
          value={selectedYear}
          onChange={handleYearChange}
          displayEmpty
          sx={{ width: 200 }}
          size='small'
        >
          {years?.map((year) => (
            <MenuItem key={year} value={year}>
              {year}
            </MenuItem>
          ))}
        </Select>
      </Box>

      <Box
        display="flex"
        alignItems="center"
        gap={2}
        width={isMobile ? '100%' : undefined}
        mt={isMobile ? 1 : 0}
      >
        <Button
          variant="outlined"
          size="small"
          onClick={() => {
            if (calendarRef.current) {
              const calendarApi = calendarRef.current.getApi();
              calendarApi.prev();

              // Get the new date from the calendar
              const newDate = calendarApi.getDate();
              const newMonth = dayjs(newDate).month();
              const newYear = dayjs(newDate).year();

              // Update state if month/year changed
              if (newMonth !== selectedMonth) setSelectedMonth(newMonth);
              if (newYear !== selectedYear) setSelectedYear(newYear);
            }
          }}
          sx={{ minWidth: 40 }}
          className='h-[40px]'
        >
          <i className="bi bi-chevron-left" />
        </Button>
        <Button
          variant="outlined"
          size="small"
          onClick={() => {
            if (calendarRef.current) {
              const calendarApi = calendarRef.current.getApi();
              calendarApi.next();

              // Get the new date from the calendar
              const newDate = calendarApi.getDate();
              const newMonth = dayjs(newDate).month();
              const newYear = dayjs(newDate).year();

              // Update state if month/year changed
              if (newMonth !== selectedMonth) setSelectedMonth(newMonth);
              if (newYear !== selectedYear) setSelectedYear(newYear);
            }
          }}
          sx={{ minWidth: 40 }}
          className='h-[40px]'
        >
          <i className="bi bi-chevron-right" />
        </Button>
      </Box>
    </Box>


      <Box sx={{

        '& .fc': {
          fontSize: isMobile ? '0.8rem' : '1rem',
          height: '75vh !important',
        },
        '& .fc-scroller': {
          display: 'hidden !important'
        },


        '& .fc-event': {
          fontSize: isMobile ? '0.7rem' : '0.85rem',
          padding: isMobile ? '1px 2px' : '2px 4px'
        },
        '& .fc-list-event': {
          padding: isMobile ? '4px 6px' : '8px 12px'
        },

        '& .fc-event-title-container': {
          display: 'flex !important'
        }

      }}>
        <FullCalendar
          ref={calendarRef}
          {...calendarOptions}
        />
      </Box>




      {selectedBooking && (
        <EditBookingDialog
          open={editModal}
          handleClose={() => setEditModal(false)}
          onConfirm={handleEditConfirm}
          bookingData={selectedBooking}
          fetchData={() => fetchBookings(rangeStart, rangeEnd, selectedCarer === 'all' ? null : selectedCarer)}
        />
      )}
    </>
  );
};

export default Calendar