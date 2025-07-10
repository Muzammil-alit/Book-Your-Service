'use client'

import type { ChildrenType } from '@core/types'
import ClientRouteGuard from '@/hocs/ClientRouteGuard'
import { MultiBookingProvider } from '../../../../contexts/bookingContexts/MultiBookingContext'
import { BookingProvider } from '../../../../contexts/bookingContexts/BookingContext'

const ClientLayout = ({ children }: ChildrenType) => {
  return (
    <>
      <ClientRouteGuard>

        <MultiBookingProvider>
          <BookingProvider>
            {children}

          </BookingProvider>
        </MultiBookingProvider>
      </ClientRouteGuard>
    </>
  )
}

export default ClientLayout 