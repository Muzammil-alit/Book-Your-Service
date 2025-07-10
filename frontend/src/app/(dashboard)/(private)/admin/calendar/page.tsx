'use client'

import CalendarWrapper from '@/views/admin/calendar/CalendarWrapper'
import AppFullCalendar from '@/libs/styles/AppFullCalendar'


const CalendarPage = () => {
  return (

    <AppFullCalendar className='app-calendar'>
      <CalendarWrapper />
    </AppFullCalendar>
  )
}

export default CalendarPage 