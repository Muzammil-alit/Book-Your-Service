'use client'

import { ReactNode } from 'react'
import CarerRouteGuard from '@/hocs/CarerRouteGuard'

interface CarerRosterLayoutProps {
  children: ReactNode
}

const CarerRosterLayout = async ({ children }: CarerRosterLayoutProps) => {

  return (
    <CarerRouteGuard>
          {children}
    </CarerRouteGuard>
  )
}

export default CarerRosterLayout 