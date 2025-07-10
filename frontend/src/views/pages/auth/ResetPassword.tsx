'use client'

// React Imports
import { useEffect, useState } from 'react'

// Next Imports
import Link from 'next/link'
import { useRouter } from 'next/navigation'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import Button from '@mui/material/Button'
import { Controller, useForm } from 'react-hook-form'
import { valibotResolver } from '@hookform/resolvers/valibot'

// Type Imports
import type { Mode } from '@core/types'

// Component Imports
import DirectionalIcon from '@components/DirectionalIcon'

// Hook Imports
import { useImageVariant } from '@core/hooks/useImageVariant'

// Util Imports
import { validateResetPasswordCodeApiCall, resetPasswordApiCall } from '@/views/auth/action'
import { pipe, string, nonEmpty, minLength, maxLength, custom, object } from 'valibot'

// Validation Schema
const schema = object({
  password: pipe(
    string(),
    nonEmpty('Password is required'),
    minLength(8, 'Password must be at least 8 characters long'),
    maxLength(50, 'Password cannot be longer than 50 characters'),
    custom(
      val => /[A-Z]/.test(val as string),
      'Password must contain at least one uppercase letter'
    ),
    custom(
      val => /[a-z]/.test(val as string),
      'Password must contain at least one lowercase letter'
    ),
    custom(
      val => /\d/.test(val as string),
      'Password must contain at least one number'
    ),
    custom(
      val => /[!@#$%^&*()\-_=+{};:,<.>]/.test(val as string),
      'Password must contain at least one special character'
    )
  ),
  confirmPassword: pipe(
    string(),
    nonEmpty('Confirm Password is required')
  )
})

type FormData = {
  password: string
  confirmPassword: string
}

const ResetPassword = ({ mode }: { mode: Mode }) => {
  const router = useRouter()

  // States
  const [isPasswordShown, setIsPasswordShown] = useState(false)
  const [isConfirmPasswordShown, setIsConfirmPasswordShown] = useState(false)
  const [isValidCode, setIsValidCode] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [resetCode] = useState('DD0HY4N4Y2') // You might want to get this from URL params instead

  // Vars
  const darkImg = '/images/pages/auth-v1-mask-3-dark.png'
  const lightImg = '/images/pages/auth-v1-mask-3-light.png'

  // Hooks
  const authBackground = useImageVariant(mode, lightImg, darkImg)

  const {
    control,
    handleSubmit,
    watch,
    setError,
    formState: { errors }
  } = useForm<FormData>({
    resolver: valibotResolver(schema),
    defaultValues: {
      password: '',
      confirmPassword: ''
    }
  })

  const handleClickShowPassword = () => setIsPasswordShown(show => !show)
  const handleClickShowConfirmPassword = () => setIsConfirmPasswordShown(show => !show)

  useEffect(() => {
    const validateResetCode = async () => {
      try {
        const result = await validateResetPasswordCodeApiCall(resetCode)
        setIsValidCode(result)
      } catch (err) {
        setIsValidCode(false)
      }
    }
    validateResetCode()
  }, [resetCode])

  const onSubmit = async (data: FormData) => {
    if (data.password !== data.confirmPassword) {
      setError('confirmPassword', {
        type: 'manual',
        message: 'Passwords do not match'
      })
      return
    }

    setIsSubmitting(true)
    
    try {
      const success = await resetPasswordApiCall(resetCode, data.password)
      if (success) {
        router.push('/login') // Adjust the route as needed
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className='flex flex-col justify-center items-center min-bs-[100dvh] is-full relative p-6'>
      {true ? (         // Put is valid code here when emails starts to work
        <Card className='flex flex-col sm:is-[460px]'>
          <CardContent className='p-6 sm:!p-12'>
            <Typography variant='h4'>Reset Password 🔒</Typography>
            <div className='flex flex-col gap-5'>
              <Typography className='mbs-1'>
                Enter your new password
              </Typography>
              <form noValidate autoComplete='off' onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-5'>
                <Controller
                  name='password'
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      autoFocus
                      fullWidth
                      label='Password'
                      type={isPasswordShown ? 'text' : 'password'}
                      error={Boolean(errors.password)}
                      helperText={errors.password?.message}
                      slotProps={{
                        input: {
                          endAdornment: (
                            <InputAdornment position='end'>
                              <IconButton
                                size='small'
                                edge='end'
                                onClick={handleClickShowPassword}
                                onMouseDown={e => e.preventDefault()}
                              >
                                <i className={isPasswordShown ? 'ri-eye-off-line' : 'ri-eye-line'} />
                              </IconButton>
                            </InputAdornment>
                          )
                        }
                      }}
                    />
                  )}
                />
                <Controller
                  name='confirmPassword'
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label='Confirm Password'
                      type={isConfirmPasswordShown ? 'text' : 'password'}
                      error={Boolean(errors.confirmPassword)}
                      helperText={errors.confirmPassword?.message}
                      slotProps={{
                        input: {
                          endAdornment: (
                            <InputAdornment position='end'>
                              <IconButton
                                size='small'
                                edge='end'
                                onClick={handleClickShowConfirmPassword}
                                onMouseDown={e => e.preventDefault()}
                              >
                                <i className={isConfirmPasswordShown ? 'ri-eye-off-line' : 'ri-eye-line'} />
                              </IconButton>
                            </InputAdornment>
                          )
                        }
                      }}
                    />
                  )}
                />
                <Button 
                  variant='contained' 
                  type='submit'
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Resetting Password...' : 'Set New Password'}
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className='flex flex-col sm:is-[460px]'>
          <CardContent className='p-6 sm:!p-12 text-center'>
            <div className='flex flex-col items-center gap-5'>
              <div className='bg-error-50 rounded-full'>
                <i className='ri-error-warning-line text-error-500 text-6xl text-red-400' />
              </div>
              <Typography variant='h5' className='text-error-500'>
                Unauthorized access
              </Typography>
              <Typography variant='body1' className='text-center'>
                Your reset password token is invalid or expired. Please generate another and try again.
              </Typography>
              <Button
                variant='contained'
                color='primary'
                onClick={() => router.push('/forgot-password')}
                startIcon={<i className='ri-refresh-line' />}
                className='mt-4'
              >
                Generate New Token
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      <img src={authBackground} className='absolute bottom-[5%] z-[-1] is-full max-md:hidden' />
    </div>
  )
}

export default ResetPassword