'use client'

import type { ChildrenType } from '@core/types'
import AdminRouteGuard from '@/hocs/AdminRouteGuard'

const AdminLayout = ({ children }: ChildrenType) => {
  return (
    <AdminRouteGuard>
      {children}
    </AdminRouteGuard>
  )
}

export default AdminLayout 