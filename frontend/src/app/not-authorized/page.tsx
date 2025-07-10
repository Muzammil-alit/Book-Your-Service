'use client'

import { useRouter } from 'next/navigation'
import NotAuthorized from "@/views/NotAuthorized"

const NotAuthorizedPage = () => {
  const router = useRouter()
  const userType = sessionStorage.getItem('userType')

  // Determine where to redirect based on user type
  const handleRedirect = () => {
    if (userType === '1') {
      router.push('/admin/login')
    } 
    else if (userType === '2') {
      router.push('/client/login')
    } 
    else if (userType === '3') {
      router.push('/carer/login')
    } 
    
    // Fallback if userType is not recognized
    else {
      router.push('/client/login')
    }
  }

  return (
    <NotAuthorized onRedirect={handleRedirect} />
  )
}

export default NotAuthorizedPage 