'use client'

import type { ChildrenType } from '@core/types'
import CarerRouteGuard from '@/hocs/CarerRouteGuard'

const CarerLayout = ({ children }: ChildrenType) => {
  return (
    <CarerRouteGuard>
      {children}
    </CarerRouteGuard>
  )
}

export default CarerLayout 