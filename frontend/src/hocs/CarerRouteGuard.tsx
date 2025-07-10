"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAppSelector } from '@/redux/useAppSelector'
import { CircularProgress, Typography } from '@mui/material'
import type { ChildrenType } from '@core/types'

export default function CarerRouteGuard({ children }: ChildrenType) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const data = useAppSelector((state) => state.authReducer.carer)

  useEffect(() => {
    // Check if carer is logged in
    if (!localStorage.getItem('carerToken')) {
      router.push('/carer/login')
      return
    }

    // Set loading to false to render children
    setLoading(false)
  }, [data, router])

  useEffect(() => {
    // Check if carer is logged in
    if (localStorage.getItem('carerLoggedIn') == 'true') {
      sessionStorage.setItem('userType', '3')
      return
    }

    // Set loading to false to render children
    setLoading(false)
  }, [])


  return <>{children}</>
} 