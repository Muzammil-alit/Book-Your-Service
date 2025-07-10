'use client'

import TimeslotSelection from '@/views/client/booking/timeslot/page'
import React from 'react'
import { MultiBookingProvider } from '../../../../../../contexts/bookingContexts/MultiBookingContext'

function page() {
  return (
      <TimeslotSelection/>
  )
}

export default page