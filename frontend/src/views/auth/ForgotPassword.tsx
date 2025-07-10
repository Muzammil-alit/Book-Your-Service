'use client'

// Next Imports
import Link from 'next/link'
import { useRouter } from 'next/navigation'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Modal from '@mui/material/Modal'
import Fade from '@mui/material/Fade'
import Backdrop from '@mui/material/Backdrop'
import Box from '@mui/material/Box'
import { Controller, useForm } from 'react-hook-form'
import { valibotResolver } from '@hookform/resolvers/valibot'

// Type Imports
import type { Mode } from '@core/types'

// Component Imports
import DirectionalIcon from '@components/DirectionalIcon'

// Hook Imports
import { useImageVariant } from '@core/hooks/useImageVariant'
import { toast } from 'react-toastify'
import { useState, useEffect } from 'react'

// Util Imports
import { generateResetPasswordCode } from '@/views/auth/action'
import { object, minLength, string, email, pipe } from 'valibot'

// Validation Schema
const schema = object({
  email: pipe(
    string(), 
    minLength(1, 'Email is required'), 
    email('Please enter a valid email address')
  )
})

type FormData = {
  email: string
}

const ForgotPassword = ({ mode }: { mode: Mode }) => {
  // Vars
  const darkImg = '/images/pages/auth-v1-mask-4-dark.png'
  const lightImg = '/images/pages/auth-v1-mask-4-light.png'

  // State
  const [resetSuccessOpen, setResetSuccessOpen] = useState(false)
  const [countdown, setCountdown] = useState(5)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Hooks
  const authBackground = useImageVariant(mode, lightImg, darkImg)
  const router = useRouter()

  const {
    control,
    handleSubmit,
    formState: { errors }
  } = useForm<FormData>({
    resolver: valibotResolver(schema),
    defaultValues: {
      email: ''
    }
  })

  // Effect for auto-redirect and countdown
  useEffect(() => {
    let timer: NodeJS.Timeout
    let countdownInterval: NodeJS.Timeout

    if (resetSuccessOpen) {
      // Start countdown from 5
      setCountdown(5)

      // Update countdown every second
      countdownInterval = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(countdownInterval)
            return 0
          }
          return prev - 1
        })
      }, 1000)

      // Redirect after 5 seconds
      timer = setTimeout(() => {
        const loginURL = sessionStorage.getItem('loginURL') || '/client/login'
        router.push(loginURL)
      }, 5000)
    }

    return () => {
      if (timer) clearTimeout(timer)
      if (countdownInterval) clearInterval(countdownInterval)
    }
  }, [resetSuccessOpen, router])

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true)
    
    try {
      const result = await generateResetPasswordCode(data.email)
        
      if (result?.ResetPasswordCode) {
        // Show success modal
        setResetSuccessOpen(true)
      } else {
        toast.error('Failed to send reset code. Please try again.')
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleModalClose = () => {
    setResetSuccessOpen(false)
    router.push(sessionStorage.getItem('loginURL') || '/client/login')
  }

  // Modal style
  const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
    borderRadius: 2,
    outline: 'none'
  }

  return (
    <div className='flex flex-col justify-center items-center min-bs-[100dvh] is-full relative p-6'>
      <Card className='flex flex-col sm:is-[460px]'>
        <CardContent className='p-6 sm:!p-12'>
          <Typography variant='h4'>Forgot Password 🔒</Typography>
          <div className='flex flex-col gap-5'>
            <Typography className='mbs-1'>
              Enter your email and we&#39;ll send you instructions to reset your password
            </Typography>
            <form noValidate autoComplete='off' onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-5'>
              <Controller
                name='email'
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    autoFocus
                    fullWidth
                    label='Email'
                    type='email'
                    error={Boolean(errors.email)}
                    helperText={errors.email?.message}
                  />
                )}
              />
              <Button 
                fullWidth 
                variant='contained' 
                type='submit'
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Sending...' : 'Send reset link'}
              </Button>
              <Typography className='flex justify-center items-center' color='primary.main'>
                <Link
                  href={sessionStorage.getItem('loginURL') || '/client/login'}
                  className='flex items-center gap-1.5'
                >
                  <DirectionalIcon
                    ltrIconClass='ri-arrow-left-s-line'
                    rtlIconClass='ri-arrow-right-s-line'
                    className='text-xl'
                  />
                  <span>Back to Login</span>
                </Link>
              </Typography>
            </form>
          </div>
        </CardContent>
      </Card>
      <img src={authBackground} className='absolute bottom-[5%] z-[-1] is-full max-md:hidden' />

      {/* Reset Password Success Modal */}
      <Modal
        open={resetSuccessOpen}
        onClose={() => setResetSuccessOpen(false)}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
        }}
      >
        <Fade in={resetSuccessOpen}>
          <Box sx={modalStyle}>
            <div className='flex flex-col items-center gap-4'>
              <svg width={50} height={50} viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
                <path
                  d='M12 2C6.49 2 2 6.49 2 12C2 17.51 6.49 22 12 22C17.51 22 22 17.51 22 12C22 6.49 17.51 2 12 2ZM16.78 9.7L11.11 15.37C10.97 15.51 10.78 15.59 10.58 15.59C10.38 15.59 10.19 15.51 10.05 15.37L7.22 12.54C6.93 12.25 6.93 11.77 7.22 11.48C7.51 11.19 7.99 11.19 8.28 11.48L10.58 13.78L15.72 8.64C16.01 8.35 16.49 8.35 16.78 8.64C17.07 8.93 17.07 9.4 16.78 9.7Z'
                  fill='#4CAF50'
                />
              </svg>
              <Typography variant='h5' component='h2' textAlign='center'>
                Reset password code successfully sent
              </Typography>
              <Typography variant='body1' textAlign='center'>
                Check your email for further steps.
              </Typography>
              <Typography variant='caption' textAlign='center' color='text.secondary'>
                Redirecting to login in {countdown} {countdown === 1 ? 'second' : 'seconds'}...
              </Typography>
              <Button
                variant='contained'
                color='primary'
                onClick={handleModalClose}
                sx={{ mt: 2 }}
              >
                Back to Login
              </Button>
            </div>
          </Box>
        </Fade>
      </Modal>
    </div>
  )
}

export default ForgotPassword