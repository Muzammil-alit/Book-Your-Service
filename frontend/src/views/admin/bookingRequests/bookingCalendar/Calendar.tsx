import { useEffect, useRef, useState } from 'react'
import { useTheme } from '@mui/material/styles'
import {
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
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

import ConfirmBooking from '../bookingActions/ConfirmBooking'
import RejectBooking from '../bookingActions/RejectBooking'
import ConfirmWithOther from '../bookingActions/ConfirmWithOther'
import EditBookingDialog from '../bookingActions/EditBooking'
import ViewBooking from '../bookingActions/ViewBooking'

import { updateBookingStatusApiCall } from '../action'
import { getMyBookingsWithFiltersApiCall } from '../action'
import 'bootstrap-icons/font/bootstrap-icons.css'
import { toast } from 'react-toastify'
import { useSelector } from 'react-redux'
import { RootState } from '@/redux/store'


import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { formatTimeTo, GetFormattedDate, GetFormattedDateWithYearFormat } from '@/utils/commonFunction'

import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import ToggleButton from '@mui/material/ToggleButton'


import { useSearchParams } from 'next/navigation';
import AddNewBooking from '../../calendar/AddNewBooking'
import { Grid } from '@mui/system'

import { SelectChangeEvent } from '@mui/material/Select';



dayjs.extend(utc);
dayjs.extend(timezone);

type CalendarEvent = {
  id: string
  title: string
  start: Date
  end: Date
  allDay: boolean
  extendedProps: {
    calendar: string
    guests: string[]
    description: string
    BookingStatus: number
    BookingID: number | string
    RecurringBookingID: any
  }
}






function transformBookingsToEvents(bookings: any) {
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

  return bookings.map(booking => {

    const carerColor = booking.CarerColor

    const bDateTimeValue = booking.BookingDateTime.split('T');
    const bStartDateValue = bDateTimeValue[0];
    const bStartTimeValue = formatTimeTo(bDateTimeValue[1]);
    const bStartDateTime = new Date(GetFormattedDateWithYearFormat(bStartDateValue) + ' ' + bStartTimeValue);

    const bEndDateTimeValue = booking.EndTime.split('T');
    const bEndTimeValue = formatTimeTo(bEndDateTimeValue[1]);
    const bEndDateTime = new Date(GetFormattedDateWithYearFormat(bStartDateValue) + ' ' + bEndTimeValue);

    // Use the consistent time formatting
    const timeRange = formatTimeRange12Hour(bStartDateTime, bEndDateTime);
    const title = `${timeRange} ${booking.ClientName.split(' ')[0]} Requesting ${booking.ServiceName} w/ ${booking.CarerName.split(' ')[0]}`;

    return {
      title,
      start: bStartDateTime,
      end: bEndDateTime,
      allDay: false,
      extendedProps: {
        type: 'booking',
        BookingStatus: booking.BookingStatus,
        BookingID: booking.BookingID,
        CarerName: booking.CarerName,
        CarerColor: carerColor,
        ServiceID: booking.ServiceID,
        Duration: booking.Duration,
        BookingDateTime: booking.BookingDateTime,
        RecurringBookingID: booking.RecurringBookingID,
        Status: booking.BookingStatus,

        ServiceName: booking.ServiceName,
        CancelledByAdmin: booking.CancelledByAdmin,
      }
    };
  });
}


const Calendar = ({ data, handleViewModeChange, viewMode }) => {
  // Refs
  const calendarRef = useRef<FullCalendar>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // State
  const [bookings, setBookings] = useState([]);
  const [anchorPosition, setAnchorPosition] = useState<{ top: number; left: number } | null>(null);
  const [hoveredEvent, setHoveredEvent] = useState<CalendarEvent | null>(null);
  const [currentView, setCurrentView] = useState('dayGridMonth');
  const [displayMonth, setDisplayMonth] = useState<string>('');
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [confirmWithOtherCarerModalOpen, setConfirmWithOtherCarerModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [actionByViewMode, setActionByViewMode] = useState('');
  const [selectedCarer, setSelectedCarer] = useState('');


  // Responsive state
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  const [loading, setLoading] = useState(false)


  const [cancelAll, setCancelAll] = useState(false)


  const searchParams = useSearchParams();
  const filterFromDashboard = searchParams.get('filter') ? searchParams.get('filter') : null;



  const [addBooking, setAddBooking] = useState(false)


  // Month and year selection
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const currentYear = dayjs().year();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);
  const [selectedMonth, setSelectedMonth] = useState(dayjs().month());
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [dateFilterParams, setDateFilterParams] = useState({
    dateFrom: null,
    dateTo: null,
    bookingStatus: filterFromDashboard == 'pending' ? 0 : null,
    bookingType: null
  });









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

  // When the calendar view changes or when dates are set
  const handleDatesSet = (dateInfo: any) => {
    setLoading(true);
    const viewType = dateInfo.view.type;
    setCurrentView(viewType);

    let dateFrom, dateTo;

    if (viewType === 'dayGridMonth') {
      const firstVisibleDate = dateInfo.start;
      const visibleMonth = firstVisibleDate.getMonth();
      const visibleYear = firstVisibleDate.getFullYear();

      setSelectedMonth(visibleMonth);
      setSelectedYear(visibleYear);
      setDisplayMonth(`${months[visibleMonth]} ${visibleYear}`);

      const monthStart = dayjs().year(visibleYear).month(visibleMonth).startOf('month');
      const monthEnd = dayjs().year(visibleYear).month(visibleMonth).endOf('month');

      dateFrom = monthStart.format('YYYY-MM-DD');
      dateTo = monthEnd.format('YYYY-MM-DD');
    } else {
      dateFrom = dayjs(dateInfo.start).format('YYYY-MM-DD');
      dateTo = dayjs(dateInfo.end).format('YYYY-MM-DD');
    }

    setDateFilterParams({
      dateFrom,
      dateTo,
      bookingStatus: dateFilterParams.bookingStatus,
      bookingType: dateFilterParams.bookingType
    });
  };

  const handleViewChange = (viewInfo: any) => {
    setCurrentView(viewInfo.view.type);
  };




  const [isFirstLoad, setIsFirstLoad] = useState(true);

  const fetchBookings = async () => {
    try {
      
      if (isFirstLoad) {
        setLoading(true);
      }


      const params = dateFilterParams;

      const converted = {
        ...params,
        bookingType: params.bookingType === "regular" ? 1 : params.bookingType === 'recurring' ? 2 : null,
      };

      const apiBookings = await getMyBookingsWithFiltersApiCall(converted) as any[];
      setBookings(apiBookings);
      
      if (isFirstLoad) {
        setIsFirstLoad(false);
      }


    } catch (error) {
      toast.error('Failed to load bookings');
    }
    finally {
      setLoading(false)
    }
  };

  useEffect(() => {
    if (dateFilterParams.dateFrom !== null || dateFilterParams.dateTo !== null) {
      fetchBookings();
    }
  }, [dateFilterParams, isMobile]);

  const events = bookings?.length ? transformBookingsToEvents(bookings) : [];

  // Theme
  const theme = useTheme();

  const handleMenuClose = () => {
    setAnchorPosition(null);
  };

  const handleEventClick = (clickInfo: any) => {
    const event = clickInfo.event._def;
    setHoveredEvent(event);
    setAnchorPosition({
      top: clickInfo.jsEvent.clientY,
      left: clickInfo.jsEvent.clientX
    });
  };

  const handleMonthChange = (e: SelectChangeEvent<number>) => {
    const month = e.target.value as number;
    setSelectedMonth(month);
    updateCalendarDate(month, selectedYear);
  };

  const handleYearChange = (e: SelectChangeEvent<number>) => {
    const year = e.target.value as number;
    setSelectedYear(year);
    updateCalendarDate(selectedMonth, year);
  };

  const updateCalendarDate = (month: number, year: number) => {
    const targetDate = dayjs().year(year).month(month).date(1);
    setDisplayMonth(`${months[month]} ${year}`);

    if (calendarRef.current) {
      const calendarApi = calendarRef.current.getApi();
      calendarApi.gotoDate(targetDate.toDate());

      if (currentView === 'dayGridMonth') {
        const start = targetDate.startOf('month').format('YYYY-MM-DD');
        const end = targetDate.endOf('month').format('YYYY-MM-DD');

        setDateFilterParams({
          dateFrom: start,
          dateTo: end,
          bookingStatus: dateFilterParams.bookingStatus,
          bookingType: dateFilterParams.bookingType
        });
      }
    }
  };

  const handleMobileDateChange = (e: SelectChangeEvent<string>) => {
    const [month, year] = e.target.value.split('-').map(Number);
    setSelectedMonth(month);
    setSelectedYear(year);
    updateCalendarDate(month, year);
  };

  const loggedInUserID = useSelector((state: RootState) => state.authReducer?.admin?.user?.userID);

  const handleConfirmBooking = async () => {
    try {
      const res = await updateBookingStatusApiCall(hoveredEvent?.extendedProps?.BookingID, 1, null, loggedInUserID);
      if (res?.isOk) {
        toast.success('Booking confirmed successfully');
        fetchBookings();
        setConfirmModalOpen(false);
        setViewModalOpen(false);
      }
    } catch (err) {
      toast.error('Failed to confirm booking');
    }
  };

  const handleCancelBooking = async () => {
    try {
      const res = await updateBookingStatusApiCall(hoveredEvent?.extendedProps?.BookingID, 101, null, loggedInUserID, null, cancelAll, true);
      if (res?.isOk) {
        toast.success('Booking cancelled successfully');
        fetchBookings();
        setCancelModalOpen(false);
        setViewModalOpen(false);
        setCancelAll(false)
      }
    } catch (err) {
      toast.error('Failed to cancel booking');
    }
  };

  const handleConfirmWithOther = async () => {
    try {
      const res = await updateBookingStatusApiCall(hoveredEvent?.extendedProps?.BookingID, 1, selectedCarer, loggedInUserID);
      if (res?.isOk) {
        toast.success('Booking confirmed with the selected carer');
        fetchBookings();
        setConfirmWithOtherCarerModalOpen(false);
        setViewModalOpen(false);
      }
    } catch (err) {
      toast.error('Failed to confirm with other carer');
    }
  };

  const handleEditConfirm = async () => {
    toast.success('Booking edited successfully');
    setEditModalOpen(false);
    setAddBooking(false)
  };

  const today = dayjs().format('YYYY-MM-DD');







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
    datesSet: handleDatesSet,
    viewDidMount: handleViewChange,
    longPressDelay: 100,
    selectLongPressDelay: 100,
    eventLongPressDelay: 100,
    dayMaxEvents: 3,


    eventOrder: [
      ((a, b) => {
        const aEvent = a as any;
        const bEvent = b as any;

        if (aEvent.extendedProps.type === 'booking' && bEvent.extendedProps.type === 'booking') {
          const statusOrder: Record<number, number> = {
            0: 1,    // pending
            1: 2,    // confirmed
            101: 3   // cancelled
          };

          const statusA = statusOrder[aEvent.extendedProps.Status] ?? 0;
          const statusB = statusOrder[bEvent.extendedProps.Status] ?? 0;

          const statusComparison = statusA - statusB;
          if (statusComparison !== 0) return statusComparison;

          return new Date(aEvent.extendedProps.BookingDateTime).getTime() - new Date(bEvent.extendedProps.BookingDateTime).getTime();
        }

        return 0;
      }) as any,
      'start',
      'title'
    ],




    views: {
      timeGridWeek: {
        allDaySlot: false,
      },
      timeGridDay: {
        allDaySlot: false,
      },
      dayGridMonth: {
        fixedWeekCount: false,
        showNonCurrentDates: false
      },
      listWeek: {
        listDayFormat: isMobile ? { weekday: 'short', month: 'short', day: 'numeric' } : undefined,
        listDaySideFormat: isMobile ? false : undefined
      }
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




      const status = event.extendedProps.BookingStatus;
      const textDecoration = status === 101 ? 'line-through' : 'none';

      let bgColor = '';
      let borderColor = '';
      let textColor = '';
      let fontWeight = '';
      let cursor = '';

      if (status === 0) {
        bgColor = '#FEF3C7';
        borderColor = '#FCD34D';
        textColor = '#92400E';
        fontWeight = '700';
        cursor = 'pointer';
      } else if (status === 1) {
        bgColor = '#D1FAE5';
        borderColor = '#6EE7B7';
        textColor = '#065F46';
        fontWeight = '700';
        cursor = 'pointer';
      } else if (status === 101) {
        bgColor = '#FECACA';
        borderColor = '#F87171';
        textColor = '#7F1D1D';
        fontWeight = '700';
        cursor = 'pointer';
      }

      // Apply styles
      el.style.setProperty('background-color', bgColor, 'important');
      el.style.setProperty('border-color', borderColor, 'important');
      el.style.setProperty('color', textColor, 'important');
      el.style.setProperty('font-weight', fontWeight, 'important');
      el.style.setProperty('cursor', cursor, 'important');

      el.style.setProperty('text-decoration', textDecoration, 'important');

      if (isMobile) {
        el.style.setProperty('padding', '2px', 'important');
        el.style.setProperty('margin', '1px 0', 'important');
        el.style.setProperty('font-size', '0.7rem', 'important');
      }

      // Recursive text color application
      const setTextColorRecursive = (node: HTMLElement) => {
        node.style.setProperty('color', textColor, 'important');
        Array.from(node.children).forEach(child => setTextColorRecursive(child as HTMLElement));
      };
      setTextColorRecursive(el);

      // Remove dot if exists
      const dotEl = el.querySelector('.fc-daygrid-event-dot');
      if (dotEl) {
        dotEl.style.setProperty('display', 'none', 'important');
      }

      // Add accessibility attributes
      el.setAttribute('title', event.title);
      el.setAttribute('tabindex', '-1');

      // Add status icon
      const titleEl = el.querySelector('.fc-event-title');
      if (titleEl) {
        // Clear any existing icons first
        const existingIcons = el.querySelectorAll('.status-icon');
        existingIcons.forEach(icon => icon.remove());

        // Create icon element
        const icon = document.createElement('span');
        icon.className = 'status-icon'; // Add this class
        icon.style.marginRight = '2px'; // Add some spacing
        icon.style.display = 'inline-flex'; // Ensures proper alignment

        // Set icon based on status (using BookingStatus consistently)
        if (status === 1) { // Confirmed
          icon.innerHTML = `
  <svg xmlns="http://www.w3.org/2000/svg"
       width="16" height="16"
       viewBox="0 0 16 16"
       style="position: relative; right: 2px; vertical-align: middle; display: inline-block; line-height: 1;">
    <circle cx="8" cy="8" r="8" fill="green" />
    <path fill="white" d="M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.992 4.99a.75.75 0 0 1-1.08.02L5.324 9.384a.75.75 0 1 1 1.06-1.06l1.094 1.093 3.493-4.425z"/>
  </svg>`;
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


        // Create a chip to show if its a recurring booking 
        if (event.extendedProps.RecurringBookingID) {
          const chip = document.createElement('div');

          chip.innerHTML = `
      <div style="
        position: absolute;
        top: -8px;
        right: -8px;
        background-color: #28a745;
        color: white;
        border-radius: 50%;
        width: 16px;
        height: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        box-shadow: 0 1px 3px rgba(0,0,0,0.3);
        z-index: 10;
      ">
        <i class="ri-refresh-line" style="
          font-size: 12px;
          display: inline-block;
          color: white;
        "></i>
      </div>
    `;
          el.appendChild(chip);

        }


      }
    },

    eventClick: handleEventClick,
    plugins: isMobile ?
      [interactionPlugin, dayGridPlugin, listPlugin] :
      [interactionPlugin, dayGridPlugin, timeGridPlugin, listPlugin],
    initialView: isMobile ? 'listWeek' : 'dayGridMonth',
    headerToolbar: isMobile ? false : {
      start: '',
      end: ' '
    },
    height: isMobile ? 'auto' : isTablet ? '70vh' : '80vh',
    eventTimeFormat: isMobile ? {
      hour: '2-digit',
      minute: '2-digit',
      omitZeroMinute: false,
      meridiem: 'short'
    } : undefined,

    direction: theme.direction
  };

  return (
    <>
      {/* Responsive Header */}
      <Box
        display="flex"
        sx={{ flexWrap: 'wrap' }}
        flexDirection={isMobile ? "column" : "row"}
        alignItems={isMobile ? "stretch" : "center"}
        justifyContent='space-between'
        gap={2}
        mb={2}
      >
        {/* Filters - stacked on mobile */}
        <Box
          display="flex"
          flexDirection={isMobile ? "column" : "row"}
          alignItems={isMobile ? "stretch" : "center"}
          gap={2}
          width={isMobile ? "100%" : undefined}
        >
          {isMobile ? (
            <>
              <Select<string>
                value={`${selectedMonth}-${selectedYear}`}
                onChange={handleMobileDateChange}
                sx={{ width: 200 }}
                size='small'
              >
                {months.map((month, monthIndex) =>
                  years.map(year => (
                    <MenuItem key={`${monthIndex}-${year}`} value={`${monthIndex}-${year}`}>
                      {month} {year}
                    </MenuItem>
                  ))
                )}
              </Select>
              <Select
                value={dateFilterParams.bookingStatus === null ? 'all' : dateFilterParams.bookingStatus}
                onChange={e => {
                  setDateFilterParams(prev => ({
                    ...prev,
                    bookingStatus: e.target.value === 'all' ? null : Number(e.target.value)
                  }));
                }}
                sx={{ width: 200 }}
                size='small'
              >
                <MenuItem value='all'>All</MenuItem>
                <MenuItem value={0}>Pending</MenuItem>
                <MenuItem value={1}>Confirmed</MenuItem>
                <MenuItem value={101}>Cancelled</MenuItem>
              </Select>
            </>
          ) : (
            <>
              <Select
                value={dateFilterParams.bookingStatus === null ? 'all' : dateFilterParams.bookingStatus}
                sx={{ width: 200 }}
                onChange={e => {
                  setDateFilterParams(prev => ({
                    ...prev,
                    bookingStatus: e.target.value === 'all' ? null : Number(e.target.value)
                  }));
                }}
                size='small'
              >
                <MenuItem value='all'>All</MenuItem>
                <MenuItem value={0}>Pending</MenuItem>
                <MenuItem value={1}>Confirmed</MenuItem>
                <MenuItem value={101}>Cancelled</MenuItem>
              </Select>

              <Select
                value={dateFilterParams.bookingType === null ? 'all' : dateFilterParams.bookingType}
                onChange={e => {
                  setDateFilterParams(prev => ({
                    ...prev,
                    bookingType: e.target.value === 'all' ? null : e.target.value
                  }));
                }}
                displayEmpty
                sx={{ width: 200 }}
                size='small'
              >
                <MenuItem value="all">All Types</MenuItem>
                <MenuItem value="regular">Regular</MenuItem>
                <MenuItem value="recurring">Recurring</MenuItem>
              </Select>

              <Select
                value={selectedMonth}
                onChange={handleMonthChange}
                sx={{ width: 200 }}
                size='small'
              >
                {months.map((month, index) => (
                  <MenuItem key={month} value={index}>{month}</MenuItem>
                ))}
              </Select>
              <Select
                value={selectedYear}
                onChange={handleYearChange}
                sx={{ width: 200 }}
                size='small'
              >
                {years.map((year) => (
                  <MenuItem key={year} value={year}>{year}</MenuItem>
                ))}
              </Select>
            </>
          )}
        </Box>

        <Box className='flex gap-4'>
          {/* Add New Carer Button */}
          <Grid >
            <Button
              variant="contained"
              onClick={() => setAddBooking(!addBooking)}
              className="h-[40px]"
            >
              Add Booking
            </Button>
          </Grid>

          {/* Navigation - different layout for mobile */}
          <Box
            display="flex"
            alignItems="center"
            justifyContent={isMobile ? "space-between" : "flex-end"}
            gap={2}
            width={isMobile ? "100%" : undefined}
            mt={isMobile ? 1 : 0}
          >
            <Box display="flex" gap={1}>
              <Button
                variant="outlined"
                size="small"
                onClick={() => {
                  if (calendarRef.current) {
                    calendarRef.current.getApi().prev();
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
                    calendarRef.current.getApi().next();
                  }
                }}
                sx={{ minWidth: 40 }}
                className='h-[40px]'
              >
                <i className="bi bi-chevron-right" />
              </Button>
            </Box>

            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={handleViewModeChange}
              size="small"
            >
              <ToggleButton value="card" aria-label="card view">
                <i className="ri-calendar-line" />
              </ToggleButton>
              <ToggleButton value="list" aria-label="list view">
                <i className="ri-list-check" />
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>
        </Box>
      </Box>

      {/* Calendar with responsive styling */}
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

      {/* Context Menu */}
      <Menu
        ref={menuRef}
        anchorReference="anchorPosition"
        anchorPosition={anchorPosition}
        open={Boolean(anchorPosition)}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        disableAutoFocusItem
        disableEnforceFocus
        disableRestoreFocus
      >
        {/* Confirm - only shown when BookingStatus is 0 or 101 */}
        {[0, 101].includes(hoveredEvent?.extendedProps?.BookingStatus) && (
          <MenuItem onClick={() => {
            setConfirmModalOpen(true);
            handleMenuClose();
          }}>
            <ListItemIcon>
              <i className="ri-check-line text-green-600" />
            </ListItemIcon>
            <ListItemText>Confirm Booking</ListItemText>
          </MenuItem>
        )}

        {/* Confirm with other carer - always shown */}
        <MenuItem onClick={() => {
          setConfirmWithOtherCarerModalOpen(true);
          handleMenuClose();
        }}>
          <ListItemIcon>
            <i className="ri-user-follow-line text-blue-600" />
          </ListItemIcon>
          <ListItemText>Confirm With Other Carer</ListItemText>
        </MenuItem>

        {/* Cancel - hidden when BookingStatus is 101 */}
        {hoveredEvent?.extendedProps?.BookingStatus !== 101 && (
          <MenuItem onClick={() => {
            setCancelModalOpen(true);
            handleMenuClose();
          }}>
            <ListItemIcon>
              <i className="ri-close-line text-red-600" />
            </ListItemIcon>
            <ListItemText>Cancel Booking</ListItemText>
          </MenuItem>
        )}

        {/* Edit - only shown when BookingStatus is 0 */}
        {hoveredEvent?.extendedProps?.BookingStatus === 0 && (
          <MenuItem onClick={() => {
            setEditModalOpen(true);
            handleMenuClose();
          }}>
            <ListItemIcon>
              <i className="ri-edit-line text-gray-600" />
            </ListItemIcon>
            <ListItemText>Edit Booking</ListItemText>
          </MenuItem>
        )}

        {/* View - always shown */}
        <MenuItem onClick={() => {
          setViewModalOpen(true);
          handleMenuClose();
        }}>
          <ListItemIcon>
            <i className="ri-eye-line text-blue-800 text-xl" />
          </ListItemIcon>
          <ListItemText>View Booking</ListItemText>
        </MenuItem>
      </Menu>

      {/* Modals */}
      {confirmModalOpen &&
        <ConfirmBooking
          open={confirmModalOpen || actionByViewMode == 'confirm'}
          handleClose={() => setConfirmModalOpen(false)}
          onConfirm={handleConfirmBooking}
        />
      }

      {confirmWithOtherCarerModalOpen &&
        <ConfirmWithOther
          setSelectedCarer={setSelectedCarer}
          selectedCarer={selectedCarer}
          data={hoveredEvent?.extendedProps}
          open={confirmWithOtherCarerModalOpen || actionByViewMode == 'confirmwithother'}
          handleClose={() => { setConfirmWithOtherCarerModalOpen(false) }}
          onConfirm={handleConfirmWithOther}
        />
      }

      {cancelModalOpen &&
        <RejectBooking
          open={cancelModalOpen || actionByViewMode == 'cancel'}
          handleClose={() => setCancelModalOpen(false)}
          onConfirm={handleCancelBooking}
          recurringBookingID={hoveredEvent?.extendedProps.RecurringBookingID}
          setCancelAll={setCancelAll}
          cancelAll={cancelAll}
        />
      }

      {editModalOpen &&
        <EditBookingDialog
          title=''
          bookingData={hoveredEvent ? { ...hoveredEvent.extendedProps, BookingID: String(hoveredEvent.extendedProps.BookingID) } : undefined}
          fetchBooking={fetchBookings}
          open={editModalOpen}
          handleClose={() => { setEditModalOpen(false) }}
          onConfirm={handleEditConfirm}
        />
      }

      <ViewBooking
        setActionByViewMode={setActionByViewMode}
        setConfirmModalOpen={setConfirmModalOpen}
        setConfirmWithOtherCarerModalOpen={setConfirmWithOtherCarerModalOpen}
        setCancelModalOpen={setCancelModalOpen}
        setEditModalOpen={setEditModalOpen}
        bookingData={hoveredEvent?.extendedProps}
        open={viewModalOpen}
        handleClose={() => { setViewModalOpen(false) }}
      />

      <AddNewBooking
        open={addBooking}
        handleClose={() => setAddBooking(!addBooking)}
        onConfirm={handleEditConfirm}
        fetchBooking={() => fetchBookings()}
        bookingData={hoveredEvent?.extendedProps}
      />
    </>
  );
};

export default Calendar;