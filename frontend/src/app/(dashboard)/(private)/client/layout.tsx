'use client'

import type { ChildrenType } from '@core/types'
import ClientRouteGuard from '@/hocs/ClientRouteGuard'
import { MultiBookingProvider } from './context/MultiBookingContext'
import { BookingProvider } from './context/BookingContext'

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