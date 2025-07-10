"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAppSelector } from '@/redux/useAppSelector'
import { CircularProgress, Typography } from '@mui/material'
import type { ChildrenType } from '@core/types'

export default function ClientRouteGuard({ children }: ChildrenType) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  const data = useAppSelector((state) => state.authReducer.client)

  useEffect(() => {

    if (!localStorage.getItem('clientToken')) {
      router.push('/client/login')
      return
    }

    // Set loading to false to render children
    setLoading(false)
  }, [data, router])

  if (loading) {
    return (
      <div className='flex items-center justify-center gap-2 grow is-full'>
        <CircularProgress />
        <Typography>Loading...</Typography>
      </div>
    )
  }

  return <>{children}</>
} 