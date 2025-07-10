'use client'

import { useEffect, useRef, useState } from 'react'
import { useTheme } from '@mui/material/styles'
import {
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Button,
  Select,
  Box
} from '@mui/material'
import FullCalendar from '@fullcalendar/react'
import listPlugin from '@fullcalendar/list'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import type { CalendarOptions } from '@fullcalendar/core'
import { Typography } from '@mui/material'
// import EditBookingDialog from './EditBooking'


import ConfirmBooking from '../bookingRequests/bookingActions/ConfirmBooking'
import RejectBooking from '../bookingRequests/bookingActions/RejectBooking'
import ConfirmWithOther from '../bookingRequests/bookingActions/ConfirmWithOther'
import EditBookingDialog from '../bookingRequests/bookingActions/EditBooking'
import ViewBooking from '../bookingRequests/bookingActions/ViewBooking'

import { useSelector } from 'react-redux'
import { useAppSelector } from '@/redux/useAppSelector'






import 'bootstrap-icons/font/bootstrap-icons.css'
import { toast } from 'react-toastify'

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { getAdminCalendar, getClientListApiCall } from './action'
import { formatTimeTo, GetFormattedDateWithYearFormat } from '@/utils/commonFunction'

import { updateBookingStatusApiCall } from '../bookingRequests/action'
import AddBookingDialog from './AddBooking'

import { useDispatch } from 'react-redux'


import { useSearchParams } from 'next/navigation';
import { getCarerListApiCall } from '../services/action'
import { Grid } from '@mui/system'
import AddNewBooking from './AddNewBooking'

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
    bookingStatus: number
  }
}



function formatTimeRange12Hour(startDate: Date, endDate: Date): string {
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
}


// Main function to transform carer data into calendar events
export function transformCarerDataToEvents(carers: any[], rangeStart: string, rangeEnd: string) {
  const events: any[] = [];
  const startDate = new Date(rangeStart);
  const endDate = new Date(rangeEnd);

  // Calculate the date range for available slots (8 days after today to 28 days span)
  const today = new Date();
  const availableStartDate = new Date(today);
  availableStartDate.setDate(today.getDate() + 8); // Exactly 8 days after today
  const availableEndDate = new Date(availableStartDate);
  availableEndDate.setDate(availableStartDate.getDate() + 28 - 1); // 28 days span (inclusive)

  carers?.forEach(carer => {
    const carerColor = carer.Color || '#b8e986';
    const carerName = carer.CarerName;

    // 1. Process Bookings (show all bookings regardless of date)
    const bookings = Array.isArray(carer.Bookings[0])
      ? carer.Bookings.flat()
      : carer.Bookings;

    bookings.forEach(booking => {
      const bDateTimeValue = booking.BookingDateTime.split('T')
      const bStartDateValue = bDateTimeValue[0]
      const bStartTimeValue = formatTimeTo(bDateTimeValue[1])
      const bStartDateTime = new Date(GetFormattedDateWithYearFormat(bStartDateValue) + ' ' + bStartTimeValue)

      const bEndDateTimeValue = booking.EndTime.split('T')
      const bEndTimeValue = formatTimeTo(bEndDateTimeValue[1])
      const bEndDateTime = new Date(GetFormattedDateWithYearFormat(bStartDateValue) + ' ' + bEndTimeValue)

      // Skip bookings outside range
      if (bStartDateTime < startDate || bStartDateTime > endDate) return;

      const timeRange = formatTimeRange12Hour(bStartDateTime, bEndDateTime);
      const title = `${timeRange} ${booking.ClientName.split(' ')[0]} w/ ${carerName.split(' ')[0]}`;

      let backgroundColor = carerColor;
      let borderColor = 'transparent';
      let textDecoration = 'none';

      if (booking.BookingStatus === 101) {
        backgroundColor = carerColor;
        borderColor = 'gray';
        textDecoration = 'line-through';
      }

      events.push({
        title,
        start: bStartDateTime,
        end: bEndDateTime,
        allDay: false,
        backgroundColor,
        borderColor,
        textDecoration,
        extendedProps: {
          type: 'booking',
          Status: booking.BookingStatus,
          BookingID: booking.BookingID,
          CarerName: carerName,
          CarerID: booking.CarerID,
          ClientName: booking.ClientName,
          ServiceName: booking.ServiceName,

          ServiceID: booking.ServiceID,
          Duration: booking.Duration,
          BookingDateTime: booking.BookingDateTime,

          RecurringBookingID: booking.RecurringBookingID,
          CancelledByAdmin: booking.CancelledByAdmin,
        }
      });
    });

    // 2. Weekly Schedules (availability) - Only show within the available date range
    carer.WeeklySchedules.forEach(schedule => {
      // Convert API weekday (1=Sunday) to JS weekday (0=Sunday)
      const jsWeekDay = (schedule.WeekDay - 1) % 7;

      // Start from the later of availableStartDate or the calendar's start date
      const effectiveStartDate = availableStartDate > startDate ? availableStartDate : startDate;
      // End at the earlier of availableEndDate or the calendar's end date
      const effectiveEndDate = availableEndDate < endDate ? availableEndDate : endDate;

      // If the effective start date is after the effective end date, skip entirely
      if (effectiveStartDate > effectiveEndDate) return;

      let currentDate = new Date(effectiveStartDate);
      currentDate.setDate(currentDate.getDate() - ((currentDate.getDay() + 7 - jsWeekDay) % 7));

      // If we went before the effective start date, move forward one week
      if (currentDate < effectiveStartDate) {
        currentDate.setDate(currentDate.getDate() + 7);
      }

      while (currentDate <= effectiveEndDate) {
        const dateStr = currentDate.toISOString().split('T')[0];
        const dateObj = new Date(dateStr);

        const isOffDay = carer.OffDays.some(offDay => {
          const from = new Date(offDay.DateFrom);
          const to = new Date(offDay.DateTo);
          return dateObj >= from && dateObj <= to;
        });

        if (!isOffDay) {
          // Parse schedule times (keeping your existing format)
          const scheduleStartTime = schedule.StartTime.split('T')[1];
          const scheduleEndTime = schedule.EndTime.split('T')[1];

          const startDateTime = new Date(GetFormattedDateWithYearFormat(dateStr) + ' ' + formatTimeTo(scheduleStartTime));
          const endDateTime = new Date(GetFormattedDateWithYearFormat(dateStr) + ' ' + formatTimeTo(scheduleEndTime));

          // Check if there's any booking on this day
          const hasBookingOnThisDay = bookings.some(booking => {
            const bookingDate = new Date(booking.BookingDateTime).toISOString().split('T')[0];
            return bookingDate === dateStr && booking.BookingStatus !== 101;
          });

          if (!hasBookingOnThisDay) {
            const timeRange = formatTimeRange12Hour(startDateTime, endDateTime);
            const title = `${timeRange} ${carerName} is available`;

            events.push({
              title,
              start: startDateTime,
              end: endDateTime,
              allDay: false,
              backgroundColor: 'white',
              textColor: '#4B5563',
              borderColor: '#4B5563',
              cursor: 'pointer',
              extendedProps: {
                type: 'available',
                CarerId: carer.CarerID,
                CarerName: carerName,
                CarerColor: carerColor,
                BookingDateTime: dateStr + 'T' + scheduleStartTime,
              }
            });
          }
        }

        currentDate.setDate(currentDate.getDate() + 7);
      }
    });

    // 3. Weekly Offs (show all)
    const scheduledWeekDays = carer.WeeklySchedules?.map((s: any) => s.WeekDay) || [];
    const allWeekDays = [1, 2, 3, 4, 5, 6, 7]; // 1=Sunday, 7=Saturday (API format)
    const offWeekDays = allWeekDays.filter(day => !scheduledWeekDays.includes(day));

    offWeekDays.forEach(apiWeekDay => {
      // Convert API weekday (1=Sunday) to JS weekday (0=Sunday)
      const jsWeekDay = (apiWeekDay - 1) % 7;

      let date = new Date(startDate);
      // Find the first occurrence of this weekday on or after startDate
      while (date.getDay() !== jsWeekDay && date <= endDate) {
        date.setDate(date.getDate() + 1);
      }

      while (date <= endDate) {
        const title = `${carerName} - Weekly off`;
        events.push({
          title,
          start: dayjs(date).startOf('day').format('YYYY-MM-DD'),
          end: dayjs(date).endOf('day').format('YYYY-MM-DD'),
          allDay: true,
          backgroundColor: carerColor,
          borderColor: '#FF0000',
          extendedProps: {
            type: 'weekly-off',
            carerName
          }
        });

        date.setDate(date.getDate() + 7);
      }
    });

    // 4. Off Days (show all) - Modified to show each day as separate event
    carer.OffDays.forEach(offDay => {
      const offStart = new Date(offDay.DateFrom);
      const offEnd = new Date(offDay.DateTo);

      // Skip if completely outside our date range
      if (offEnd < startDate || offStart > endDate) return;

      const carerName = carer.CarerName;

      // Create a date for each day in the off period
      let currentOffDate = new Date(offStart);

      while (currentOffDate <= offEnd) {
        // Skip if this specific day is outside our range
        if (currentOffDate >= startDate && currentOffDate <= endDate) {
          const title = `${carerName} - Off-day`;

          events.push({
            title,
            start: dayjs(currentOffDate).format('YYYY-MM-DD'),
            end: dayjs(currentOffDate).format('YYYY-MM-DD'),
            allDay: true,
            backgroundColor: carerColor,
            borderColor: '#8B0000',
            extendedProps: {
              type: 'off-day',
              carerName,
              date: currentOffDate.toISOString().split('T')[0] // Store the date for reference
            }
          });
        }

        // Move to next day
        currentOffDate.setDate(currentOffDate.getDate() + 1);
      }
    });
  });

  return events;
}



const Calendar = () => {


  const dispatch = useDispatch()
  const searchParams = useSearchParams();
  const carerIdFromURL = searchParams.get('carerId') ? Number(searchParams.get('carerId')) : null
  const monthfromURL = searchParams.get('month') ? Number(searchParams.get('month')) : null





  const calendarRef = useRef<FullCalendar>(null);
  const menuRef = useRef<HTMLDivElement>(null)

  const [bookings, setBookings] = useState([]);
  const [editModal, setEditModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const theme = useTheme();
  const [currentView, setCurrentView] = useState('dayGridMonth');
  const [availabilityFilter, setAvailabilityFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];



  const currentYear = dayjs().year();
  const years = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);

  const [selectedMonth, setSelectedMonth] = useState(monthfromURL !== null ? monthfromURL : dayjs().month());
  const [selectedYear, setSelectedYear] = useState(currentYear);

  const [clients, setClients] = useState([])
  const [selectedCarer, setSelectedCarer] = useState('')
  const [selectedCarerForFilter, setSelectedCarerForFilter] = useState<any>(carerIdFromURL ? carerIdFromURL : null);



  const [hoveredEvent, setHoveredEvent] = useState(null)
  const [anchorPosition, setAnchorPosition] = useState<{ top: number; left: number } | null>(null)

  const [confirmModalOpen, setConfirmModalOpen] = useState(false)
  const [cancelModalOpen, setCancelModalOpen] = useState(false)
  const [confirmWithOtherCarerModalOpen, setConfirmWithOtherCarerModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [viewModalOpen, setViewModalOpen] = useState(false)

  const [actionByViewMode, setActionByViewMode] = useState('')
  const [loading, setLoading] = useState(false)

  // Responsive state
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);


  const [addBooking, setAddBooking] = useState(false)

  const [cancelAll, setCancelAll] = useState(false)




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




  const { carers } = useAppSelector((state) => state.carersReducer);


  useEffect(() => {
    const fetch = async () => {

      try {
        await getCarerListApiCall(dispatch)
      }
      catch (error) {
        toast.error(error)
      }
    }
    fetch();
  }, [])


  useEffect(() => {
    if (monthfromURL !== null && calendarRef.current) {
      const calendarApi = calendarRef.current.getApi();
      const targetDate = dayjs().year(selectedYear).month(monthfromURL).date(1);
      calendarApi.gotoDate(targetDate.toDate());

      // For month view, ensure we're using the whole month
      if (currentView === 'dayGridMonth') {
        const start = targetDate.startOf('month').format('YYYY-MM-DD');
        const end = targetDate.endOf('month').format('YYYY-MM-DD');

        setRangeStart(start);
        setRangeEnd(end);
        fetchBookings(
          start,
          end,
          selectedCarerForFilter === 'all' ? null : selectedCarerForFilter,
          typeFilter === 'all' ? null : typeFilter == 'regular' ? 1 : 2
        );
      }
    }
  }, [monthfromURL]);






  const [isFirstLoad, setIsFirstLoad] = useState(true);

  const fetchBookings = async (
    startDate: string | null = rangeStart,
    endDate: string | null = rangeEnd,
    carerId: string | null = selectedCarerForFilter,
    bookingType: number | null = typeFilter === 'all' ? null : typeFilter == 'regular' ? 1 : 2
  ) => {
    try {

      if (isFirstLoad) {
        setLoading(true);
      }


      const apiBookings = await getAdminCalendar(
        carerId == "all" ? null : carerId,
        startDate,
        endDate,
        bookingType // Add the booking type parameter
      ) as any[];
      setBookings(apiBookings);

      if (isFirstLoad) {
        setIsFirstLoad(false);
      }

    } catch (error) {
      toast.error('Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  const fetchClients = async () => {
    try {
      const clients = await getClientListApiCall()
      setClients(clients as any[])
    }
    catch (err) {

    }
  }

  useEffect(() => {
    fetchClients()
  }, [])

  // When the date range changes in the calendar
  const handleDatesSet = (dateInfo: any) => {
    setLoading(true);
    // Get view type
    const viewType = dateInfo.view.type;
    setCurrentView(viewType);

    // For month view, make sure we use the exact month boundaries
    let start, end;

    if (viewType === 'dayGridMonth') {
      // Get the 1st day of the visible month
      const firstVisibleDate = dateInfo.start;
      const visibleMonth = firstVisibleDate.getMonth();
      const visibleYear = firstVisibleDate.getFullYear();

      // Update the dropdowns to match the visible month
      setSelectedMonth(visibleMonth);
      setSelectedYear(visibleYear);

      // Set date range to exactly match the month boundaries
      start = dayjs().year(visibleYear).month(visibleMonth).startOf('month').format('YYYY-MM-DD');
      end = dayjs().year(visibleYear).month(visibleMonth).endOf('month').format('YYYY-MM-DD');
    } else {
      // For other views, use the visible date range
      start = dayjs(dateInfo.start).format('YYYY-MM-DD');
      end = dayjs(dateInfo.end).format('YYYY-MM-DD');
    }

    setRangeStart(start);
    setRangeEnd(end);

    fetchBookings(start, end, selectedCarerForFilter,);
  };

  const [events, setEvents] = useState([])
  const [rangeStart, setRangeStart] = useState('');
  const [rangeEnd, setRangeEnd] = useState('');

  useEffect(() => {
    setEvents(transformCarerDataToEvents(bookings, rangeStart, rangeEnd));
  }, [bookings])

  const handleEditConfirm = () => {
    setEditModal(false);
    setAddBooking(false)
    fetchBookings(); // Refresh the calendar after edit
  };



  const handleMenuClose = () => {
    setAnchorPosition(null)
  }

  const handleEventClick = (clickInfo: any) => {

    setHoveredEvent(clickInfo.event._def)

    const event = clickInfo.event;
    const eventData = event.extendedProps;


    // For available slots
    if (eventData.type === 'available') {
      const bookingData = {
        isNewBooking: true, // Add this flag
        CarerID: eventData.CarerId,
        CarerName: eventData.CarerName,
        CarerColor: eventData.CarerColor,
        BookingDateTime: event.start ? dayjs(event.start).format('YYYY-MM-DDTHH:mm:ss') : null,
        BookingID: event.BookingID,
        // Add any other fields you need for the edit dialog
      };


      setSelectedBooking(bookingData);
      setEditModal(true);
      clickInfo.jsEvent.preventDefault();
    }


    // For existing bookings (only if not cancelled)
    else if (eventData.type === 'booking') {

      setAnchorPosition({
        top: clickInfo.jsEvent.clientY,
        left: clickInfo.jsEvent.clientX
      })

      const bookingData = {
        isNewBooking: false, // Add this flag
        BookingID: eventData.bookingId,
        CarerID: eventData.carerId || eventData.carerName,
        CarerName: eventData.carerName,
        BookingDateTime: event.start ? dayjs(event.start).format('YYYY-MM-DDTHH:mm:ss') : null,
        // Add any other fields you need for the edit dialog
      };

      setSelectedBooking(bookingData);
      clickInfo.jsEvent.preventDefault();
    }
  };



  const today = dayjs().format('YYYY-MM-DD');

  // Handle month change
  const handleMonthChange = (e: any) => {
    const month = e.target.value as number;
    setSelectedMonth(month);

    // Create a date for the first day of the selected month
    const targetDate = dayjs().year(selectedYear).month(month).date(1);

    // Update the calendar view and fetch new data
    if (calendarRef.current) {
      const calendarApi = calendarRef.current.getApi();
      calendarApi.gotoDate(targetDate.toDate());

      // For month view, ensure we're using the whole month
      if (currentView === 'dayGridMonth') {
        const start = targetDate.startOf('month').format('YYYY-MM-DD');
        const end = targetDate.endOf('month').format('YYYY-MM-DD');

        setRangeStart(start);
        setRangeEnd(end);
        fetchBookings(
          start,
          end,
          selectedCarerForFilter === 'all' ? null : selectedCarerForFilter,
          typeFilter === 'all' ? null : typeFilter == 'regular' ? 1 : 2
        );
      }
    }
  };

  // Handle year change
  const handleYearChange = (e: any) => {
    const year = e.target.value as number;
    setSelectedYear(year);

    // Create a date for the first day of the selected month in the selected year
    const targetDate = dayjs().year(year).month(selectedMonth).date(1);

    // Update the calendar view and fetch new data
    if (calendarRef.current) {
      const calendarApi = calendarRef.current.getApi();
      calendarApi.gotoDate(targetDate.toDate());

      // For month view, ensure we're using the whole month
      if (currentView === 'dayGridMonth') {
        const start = targetDate.startOf('month').format('YYYY-MM-DD');
        const end = targetDate.endOf('month').format('YYYY-MM-DD');

        setRangeStart(start);
        setRangeEnd(end);
        fetchBookings(
          start,
          end,
          selectedCarerForFilter === 'all' ? null : selectedCarerForFilter,
          typeFilter === 'all' ? null : typeFilter == 'regular' ? 1 : 2
        );
      }
    }
  };

  // Handle view change
  const handleViewChange = (viewInfo: any) => {
    setCurrentView(viewInfo.view.type);
  };


  const handleTypeFilterChange = (e: any) => {
    const type = e.target.value as string;
    setTypeFilter(type);
    fetchBookings(
      rangeStart,
      rangeEnd,
      selectedCarerForFilter === 'all' ? null : selectedCarerForFilter,
      type === 'all' ? null : type == 'regular' ? 1 : 2
    );
  };





  const loggedInUserID = useSelector((state: any) => state.authReducer?.admin?.user?.userID)

  const handleConfirmBooking = async () => {
    try {
      const res = await updateBookingStatusApiCall(hoveredEvent?.extendedProps?.BookingID, 1, null, loggedInUserID)
      if (res?.isOk) {
        toast.success('Booking confirmed successfully')
        fetchBookings()
        setConfirmModalOpen(false)
        setViewModalOpen(false)
      }
    } catch (err) {

    }
  }

  const handleCancelBooking = async () => {

    try {
      const res = await updateBookingStatusApiCall(hoveredEvent?.extendedProps?.BookingID, 101, null, loggedInUserID, null, cancelAll, true)
      if (res?.isOk) {
        toast.success('Booking cancelled successfully')
        fetchBookings()
        setCancelModalOpen(false)
        setViewModalOpen(false)
        setCancelAll(false)
      }
    } catch (err) {

    }
  }

  const handleConfirmWithOther = async () => {
    try {
      const res = await updateBookingStatusApiCall(hoveredEvent?.extendedProps?.BookingID, 1, selectedCarer, loggedInUserID)
      if (res?.isOk) {
        toast.success('Booking confirmed with the selected carer')
        fetchBookings()
        setConfirmWithOtherCarerModalOpen(false)
        setViewModalOpen(false)
      }
    } catch (err) {

    }
  }

  // const handleEditConfirm = async () => {
  //   toast.success('Booking edited successfully')
  //   setEditModalOpen(false)
  // }


  const filterEvents = (events: any[]) => {
    return events.filter(event => {
      const { type, Status } = event.extendedProps;


      // Apply status filter
      const statusMatch =
        availabilityFilter === 'all' ||
        (availabilityFilter === 'pending' && Status === 0) ||
        (availabilityFilter === 'confirmed' && Status === 1) ||
        (availabilityFilter === 'cancelled' && Status === 101);

      // Apply availability filter
      const availabilityMatch =
        availabilityFilter === 'all' ||
        (availabilityFilter === 'available' && type === 'available') ||
        (availabilityFilter === 'unavailable' && (type === 'off-day' || type === 'weekly-off'));

      return statusMatch || availabilityMatch;
    });
  };

  // Update your events useEffect to include filtering
  useEffect(() => {
    const transformedEvents = transformCarerDataToEvents(bookings, rangeStart, rangeEnd);
    const filteredEvents = filterEvents(transformedEvents);
    setEvents(filteredEvents);
  }, [bookings, availabilityFilter]);







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



  //Calendar Options
  const calendarOptions: CalendarOptions = {

    events: loading ? generateSkeletonEvents() : events,

    displayEventTime: false,
    initialDate: today,
    eventOverlap: false,
    eventDisplay: 'block',
    fixedWeekCount: false,
    showNonCurrentDates: false,
    firstDay: 1,











    // custom event order 

    eventOrder: [
      // 1. Sort by event type
      ((a, b) => {
        const aEvent = a as any;
        const bEvent = b as any;

        const typeOrder = {
          'booking': 1,
          'available': 2,
          'off-day': 3,
          'weekly-off': 4
        };

        return (typeOrder[aEvent.extendedProps.type] ?? 999) - (typeOrder[bEvent.extendedProps.type] ?? 999);
      }) as any,

      // 2. Sort bookings by status and then BookingDateTime
      ((a, b) => {
        const aEvent = a as any;
        const bEvent = b as any;

        if (aEvent.extendedProps.type === 'booking' && bEvent.extendedProps.type === 'booking') {
          const statusOrder = {
            0: 1,    // pending
            1: 2,    // confirmed
            101: 3   // cancelled
          };

          const statusA = statusOrder[aEvent.extendedProps.Status] ?? 999;
          const statusB = statusOrder[bEvent.extendedProps.Status] ?? 999;

          const statusComparison = statusA - statusB;
          if (statusComparison !== 0) return statusComparison;

          return new Date(aEvent.BookingDateTime).getTime() - new Date(bEvent.BookingDateTime).getTime();
        }

        return 0;
      }) as any,

      // 3. Default fallback
      'start',
      'title'
    ],




    // Add datesSet callback
    datesSet: handleDatesSet,
    viewDidMount: handleViewChange,

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




      const bgColor = event.backgroundColor || '';
      const textColor = event.textColor || '#FFFFFF';
      const textDecoration = event.extendedProps.Status === 101 ? 'line-through' : 'none';

      // Set cursor based on event type and status
      const cursor = (event.extendedProps.type === 'available' ||
        (event.extendedProps.type === 'booking' && event.extendedProps.status !== 101))
        ? 'pointer' : 'default';

      // Apply styles to the main event element
      el.style.setProperty('background-color', bgColor, 'important');
      el.style.setProperty('color', textColor, 'important');
      el.style.setProperty('text-decoration', textDecoration, 'important');
      el.style.setProperty('border-color', '#9CA3AF', 'important');
      el.style.setProperty('cursor', cursor, 'important');



      // Target inner elements
      const innerElements = el.querySelectorAll('.fc-event-main, .fc-event-title');
      innerElements.forEach((innerEl: HTMLElement) => {
        innerEl.style.setProperty('color', textColor, 'important');
        innerEl.style.setProperty('text-decoration', textDecoration, 'important');
        innerEl.style.setProperty('cursor', cursor, 'important');
      });

      // Remove dot indicator
      const dotEl = el.querySelector('.fc-daygrid-event-dot');
      if (dotEl) {
        dotEl.style.setProperty('display', 'none', 'important');
      }



      // Add title attribute for tooltip
      el.setAttribute('title', event.title);

      // Add status icon before the title
      const titleEl = el.querySelector('.fc-event-title');

      if (titleEl) {
        // Clear any existing icons first
        const existingIcon = titleEl.previousElementSibling;
        if (existingIcon && existingIcon.classList.contains('status-icon')) {
          existingIcon.remove();
        }

        // Create icon element
        const icon = document.createElement('span');
        icon.className = 'status-icon'; // Add this class
        icon.style.marginRight = '2px'; // Add some spacing
        icon.style.display = 'inline-flex'; // Ensures proper alignment

        // Set icon based on status
        const status = event.extendedProps.Status;
        const type = event.extendedProps.type


        if (status === 1) { // Confirmed
          icon.innerHTML = `
  <svg xmlns="http://www.w3.org/2000/svg"
       width="16" height="16"
       viewBox="0 0 16 16"
       style="position: relative; right: 2px; vertical-align: middle; display: inline-block; line-height: 1;">
    <circle cx="8" cy="8" r="8" fill="green" />
    <path fill="white" d="M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.992 4.99a.75.75 0 0 1-1.08.02L5.324 9.384a.75.75 0 1 1 1.06-1.06l1.094 1.093 3.493-4.425z"/>
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
</svg>

`;

        }

        else if (status === 101 && event.extendedProps.CancelledByAdmin == true) { // Cancelled

          icon.innerHTML = `
<svg xmlns="http://www.w3.org/2000/svg"
     width="16" height="16"
     viewBox="0 0 16 16"
     style="position: relative; right: 2px; vertical-align: middle; display: inline-block; line-height: 1;">
  <circle cx="8" cy="8" r="8" fill="#ef4444" />
  <line x1="5" y1="5" x2="11" y2="11" stroke="white" stroke-width="1.5" stroke-linecap="round" />
  <line x1="11" y1="5" x2="5" y2="11" stroke="white" stroke-width="1.5" stroke-linecap="round" />
</svg>

`;
        }

        else if (status === 101 && event.extendedProps.CancelledByAdmin == false) { // Cancelled

          icon.innerHTML = `
<svg xmlns="http://www.w3.org/2000/svg"
     width="16" height="16"
     viewBox="0 0 16 16"
     style="position: relative; right: 2px; vertical-align: middle; display: inline-block; line-height: 1;">
  <circle cx="8" cy="8" r="8" fill="#ef4444" />
  <rect x="4.5" y="4.5" width="7" height="7" fill="white" rx="1.5" ry="1.5" />
</svg>



`;

        }

        else if (type == 'off-day') {
          icon.innerHTML = `
<svg xmlns="http://www.w3.org/2000/svg"
     width="16" height="16"
     viewBox="0 0 16 16"
     style="position: relative; right: 2px; vertical-align: middle; display: inline-block; line-height: 1;">
  <circle cx="8" cy="8" r="8" fill="#ef4444" />
  <rect x="4" y="7.25" width="8" height="1.5" rx="0.75" fill="white" />
</svg>


        `;
        }

        else if (type == 'weekly-off') {
          icon.innerHTML = `
<svg xmlns="http://www.w3.org/2000/svg"
     width="16" height="16"
     viewBox="0 0 16 16"
     style="vertical-align: middle; display: inline-block; line-height: 1;">
  <!-- Orange background circle -->
  <circle cx="8" cy="8" r="8" fill="#f97316" />

  <!-- Extra wide and slightly right-aligned white calendar icon -->
  <g transform="translate(0.2, 2.2) scale(0.8, 0.55)">
    <path fill="white" d="M14 3h-1V2a1 1 0 0 0-2 0v1H9V2a1 1 0 0 0-2 0v1H6a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zM14 18H6V7h8v11z"/>
    <rect x="7" y="9" width="6" height="1.5" rx="0.75" fill="white"/>
    <rect x="7" y="11.5" width="6" height="1.5" rx="0.75" fill="white"/>
    <rect x="7" y="14" width="4" height="1.5" rx="0.75" fill="white"/>
  </g>
</svg>





        `;
        }

        else if (type == 'available') {
          icon.innerHTML = `
<svg xmlns="http://www.w3.org/2000/svg"
     width="16" height="16"
     viewBox="0 0 24 24"
     style="position: relative; right: 2px; vertical-align: middle; display: inline-block; line-height: 1;">
  <circle cx="12" cy="12" r="12" fill="${event.extendedProps.CarerColor}" />
  <path fill="white" d="M12 5.2a3.2 3.2 0 1 1 0 6.4 3.2 3.2 0 0 1 0-6.4zm-7 10.6c0-2.8 3.9-4.2 7-4.2s7 1.4 7 4.2v1.1H5v-1.1z"/>
</svg>


`
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



    plugins: [interactionPlugin, dayGridPlugin, timeGridPlugin, listPlugin],
    initialView: 'dayGridMonth',

    headerToolbar: {
      start: '',
      end: ' '
    },

    eventResizableFromStart: true,
    dayMaxEvents: 3,
    navLinks: false,


    direction: theme.direction
  };




  const handleCarerChange = (e: any) => {
    const carerId = e.target.value as string;
    setSelectedCarerForFilter(carerId);
    fetchBookings(
      rangeStart,
      rangeEnd,
      carerId === 'all' ? null : carerId,
      typeFilter === 'all' ? null : typeFilter == 'regular' ? 1 : 2
    );
  };


  return (
    <>
      <Box
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
            labelId="client-label"
            value={selectedCarerForFilter ?? 'all'}
            onChange={handleCarerChange}
            displayEmpty
            sx={{ width: 200 }}
            size='small'
          >
            <MenuItem value="all">All Carers</MenuItem>
            {carers?.map((carer) => (
              <MenuItem key={carer.CarerID} value={carer.CarerID}>
                {carer.CarerName}
              </MenuItem>
            ))}
          </Select>

          {/* Availability Filter */}
          <Select
            value={availabilityFilter}
            onChange={(e) => setAvailabilityFilter(e.target.value)}
            displayEmpty
            sx={{ width: 200 }}
            size='small'
          >
            <MenuItem value="all">All Bookings</MenuItem>
            <MenuItem value="pending">Pending Bookings</MenuItem>
            <MenuItem value="confirmed">Confirmed Bookings</MenuItem>
            <MenuItem value="cancelled">Cancelled Bookings</MenuItem>
            <MenuItem value="available">Available Carers</MenuItem>
            <MenuItem value="unavailable">Unavailable Carers</MenuItem>
          </Select>

          <Select
            value={typeFilter}
            onChange={handleTypeFilterChange}
            displayEmpty
            sx={{ width: 200 }}
            size='small'
          >
            <MenuItem value="all">All Types</MenuItem>
            <MenuItem value="regular">Regular</MenuItem>
            <MenuItem value="recurring">Recurring</MenuItem>
          </Select>

          <Select
            labelId="month-label"
            value={selectedMonth}
            onChange={handleMonthChange}
            displayEmpty
            sx={{ width: 200 }}
            size='small'
          >
            {months?.map((month, index) => (
              <MenuItem key={month} value={index}>{month}</MenuItem>
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
              <MenuItem key={year} value={year}>{year}</MenuItem>
            ))}
          </Select>
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

          {/* Right: Prev/Next Buttons - full width on mobile */}
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
        </Box>
      </Box>

      <Box
        sx={{
          display: 'flex',
          gap: 4,
          mt: 5,
          flexWrap: 'wrap',
          justifyContent: 'center',
          position: 'relative',
          top: 6,
        }}
      >
        {bookings?.map((item, idx) => (
          <Box
            key={idx}
            sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
          >
            <Box
              sx={{
                width: 16,
                height: 16,
                borderRadius: '50%',
                bgcolor: item.Color,
              }}
            />
            <Typography variant="body2">{item.CarerName}</Typography>
          </Box>
        ))}
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
        },

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
        {/* Confirm - only shown if status is not 1 */}
        {hoveredEvent?.extendedProps?.Status !== 1 && (
          <MenuItem onClick={() => {
            setConfirmModalOpen(true)
            handleMenuClose()
          }}>
            <ListItemIcon>
              <i className="ri-check-line text-green-600" />
            </ListItemIcon>
            <ListItemText>Confirm Booking</ListItemText>
          </MenuItem>
        )}

        {/* Confirm with other carer - always shown */}
        <MenuItem onClick={() => {
          setConfirmWithOtherCarerModalOpen(true)
          handleMenuClose()
        }}>
          <ListItemIcon>
            <i className="ri-user-follow-line text-blue-600" />
          </ListItemIcon>
          <ListItemText>Confirm With Other Carer</ListItemText>
        </MenuItem>

        {/* Cancel - hidden if status is 101 */}
        {hoveredEvent?.extendedProps?.Status !== 101 && (
          <MenuItem onClick={() => {
            setCancelModalOpen(true)
            handleMenuClose()
          }}>
            <ListItemIcon>
              <i className="ri-close-line text-red-600" />
            </ListItemIcon>
            <ListItemText>Cancel Booking</ListItemText>
          </MenuItem>
        )}

        {/* Edit - only shown if status is 0 */}
        {hoveredEvent?.extendedProps?.Status === 0 && (
          <MenuItem onClick={() => {
            setEditModalOpen(true)
            handleMenuClose()
          }}>
            <ListItemIcon>
              <i className="ri-edit-line text-gray-600" />
            </ListItemIcon>
            <ListItemText>Edit Booking</ListItemText>
          </MenuItem>
        )}

        {/* View - always shown */}
        <MenuItem onClick={() => {
          setViewModalOpen(true)
          handleMenuClose()
        }}>
          <ListItemIcon>
            <i className="ri-eye-line text-blue-800 text-xl" />
          </ListItemIcon>
          <ListItemText>View Booking</ListItemText>
        </MenuItem>
      </Menu>

      {/* Confirm Booking Modal */}
      <ConfirmBooking
        open={confirmModalOpen}
        handleClose={() => setConfirmModalOpen(false)}
        onConfirm={handleConfirmBooking}
      />

      {/* Other Carer Modal */}
      <ConfirmWithOther
        setSelectedCarer={setSelectedCarer}
        selectedCarer={hoveredEvent?.extendedProps.CarerID}
        data={hoveredEvent?.extendedProps}
        open={confirmWithOtherCarerModalOpen}
        handleClose={() => { setConfirmWithOtherCarerModalOpen(false) }}
        onConfirm={handleConfirmWithOther}
      />

      {/* Cancel Booking Modal */}
      <RejectBooking
        open={cancelModalOpen}
        handleClose={() => setCancelModalOpen(false)}
        onConfirm={handleCancelBooking}
        recurringBookingID={hoveredEvent?.extendedProps.RecurringBookingID}
        setCancelAll={setCancelAll}
        cancelAll={cancelAll}
      />

      {/* Edit Booking Modal */}
      <EditBookingDialog
        title=''
        bookingData={hoveredEvent?.extendedProps}
        fetchBooking={fetchBookings}
        open={editModalOpen}
        handleClose={() => { setEditModalOpen(false) }}
        onConfirm={handleEditConfirm}
      />

      {/* View Booking Modal */}
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

      {selectedBooking && (
        <AddBookingDialog
          title=''
          open={editModal}
          handleClose={() => setEditModal(false)}
          onConfirm={handleEditConfirm}
          bookingData={selectedBooking}
          fetchBooking={() => fetchBookings(
            rangeStart,
            rangeEnd,
            selectedCarerForFilter === 'all' ? null : selectedCarerForFilter,
            typeFilter === 'all' ? null : typeFilter == 'regular' ? 1 : 2
          )}
        />
      )}

      <AddNewBooking
        open={addBooking}
        handleClose={() => setAddBooking(!addBooking)}
        onConfirm={handleEditConfirm}
        fetchBooking={() => fetchBookings(
          rangeStart,
          rangeEnd,
          selectedCarerForFilter === 'all' ? null : selectedCarerForFilter,
          typeFilter === 'all' ? null : typeFilter == 'regular' ? 1 : 2
        )}
      />
    </>
  );
};

export default Calendar