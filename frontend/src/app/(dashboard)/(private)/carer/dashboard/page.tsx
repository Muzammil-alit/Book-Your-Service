'use client'

// React Imports
import { useState } from 'react'

// MUI Imports
import { Card, CardContent, Typography } from '@mui/material'


import CalendarWrapper from '@/views/carer/calendar/CalendarWrapper'

// Styled Component Imports
import AppFullCalendar from '@/libs/styles/AppFullCalendar'




const CalendarPage = () => {
  return (
    
    <AppFullCalendar className='app-calendar'>
    <CalendarWrapper  />
  </AppFullCalendar>
  )
}

export default CalendarPage 