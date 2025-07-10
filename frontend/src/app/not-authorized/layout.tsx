'use client'

import type { ReactNode } from 'react'
import ReduxProvider from '@/redux/ReduxProvider'

export default function NotAuthorizedLayout({ children }: { children: ReactNode }) {
  return (
    <ReduxProvider>
      {children}
    </ReduxProvider>
  )
} 