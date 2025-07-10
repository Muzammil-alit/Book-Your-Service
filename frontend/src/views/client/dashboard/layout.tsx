'use client'

import { ReactNode } from 'react'
import { Box } from '@mui/material'
import ClientRouteGuard from '@/hocs/ClientRouteGuard'

interface ClientDashboardLayoutProps {
  children: ReactNode
}

const ClientDashboardLayout = ({ children }: ClientDashboardLayoutProps) => {
  return (
    <ClientRouteGuard>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          bgcolor: 'background.default'
        }}
      >
        <Box component="main" >
          {children}
        </Box>
      </Box>
    </ClientRouteGuard>
  )
}

export default ClientDashboardLayout 