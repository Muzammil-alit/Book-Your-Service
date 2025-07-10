'use client'

import { ReactNode } from 'react'
import CarerRouteGuard from '@/hocs/CarerRouteGuard'

interface CarerDashboardLayoutProps {
  children: ReactNode
}

const CarerDashboardLayout = async ({ children }: CarerDashboardLayoutProps) => {
  return (
    <CarerRouteGuard>
          {children}
    </CarerRouteGuard>
  )
}

export default CarerDashboardLayout 