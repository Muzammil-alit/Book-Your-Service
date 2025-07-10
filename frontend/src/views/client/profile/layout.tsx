'use client'

import { ReactNode } from 'react'
import { Box } from '@mui/material'
import ClientRouteGuard from '@/hocs/ClientRouteGuard'

interface ClientProfileLayoutProps {
  children: ReactNode
}

const ClientProfileLayout = ({ children }: ClientProfileLayoutProps) => {
  return (
    <ClientRouteGuard>
      <Box
      >
        <Box component="main" >
          {children}
        </Box>
      </Box>
    </ClientRouteGuard>
  )
}

export default ClientProfileLayout 