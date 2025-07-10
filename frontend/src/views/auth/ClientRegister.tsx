'use client'

// React Imports
import { useState } from 'react'

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
import Checkbox from '@mui/material/Checkbox'
import Button from '@mui/material/Button'
import FormControlLabel from '@mui/material/FormControlLabel'
import Box from '@mui/material/Box'
import FormHelperText from '@mui/material/FormHelperText'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'

// Type Imports
import type { Mode } from '@core/types'

// Hook Imports
import { useImageVariant } from '@core/hooks/useImageVariant'
import { Controller, SubmitHandler, useForm } from 'react-hook-form'
import { valibotResolver } from '@hookform/resolvers/valibot'
import { InferInput } from 'valibot'
import { object, minLength, maxLength, string, email, pipe, nonEmpty, regex, custom } from 'valibot'
import { registerAction } from './action/register'

type FormData = InferInput<typeof schema>

const schema = object({
  firstName: pipe(string(), minLength(1, 'First name is required')),
  lastName: pipe(string(), minLength(1, 'Last name is required')),
  emailID: pipe(string(), minLength(1, 'Email is required'), email('Please enter a valid email address')),
  phoneNo: pipe(
    string(),
    minLength(1, 'Phone number is required'),
    regex(/^[0-9+\s-]{8,15}$/, 'Please enter a valid phone number')
  ),
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
  ),
  agreePolicy: pipe(
    string(),
    nonEmpty('You must agree to the cancellation policy')
  ),
  subscribeNewsletter: string()
})


const ClientRegister = ({ mode }: { mode: Mode }) => {
  // States
  const [isPasswordShown, setIsPasswordShown] = useState(false)
  const [isConfirmPasswordShown, setIsConfirmPasswordShown] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [genericError, setGenericError] = useState<string | null>(null)
  const [policyDialogOpen, setPolicyDialogOpen] = useState(false)

  // Vars
  const darkImg = '/images/pages/auth-v1-mask-1-dark.png'
  const lightImg = '/images/pages/auth-v1-mask-1-light.png'

  // Hooks
  const authBackground = useImageVariant(mode, lightImg, darkImg)
  const router = useRouter()

  const {
    control,
    handleSubmit,
    watch,
    setError,
    formState: { errors }
  } = useForm<FormData>({
    resolver: valibotResolver(schema),
    defaultValues: {
      firstName: '',
      lastName: '',
      emailID: '',
      phoneNo: '',
      password: '',
      confirmPassword: '',
      agreePolicy: '',
      subscribeNewsletter: ''
    }

  })

  // Watch password for validation
  const password = watch('password')

  // Watch agreePolicy for button activation
  const agreePolicy = watch('agreePolicy')

  const handleClickShowPassword = () => setIsPasswordShown(show => !show)
  const handleClickShowConfirmPassword = () => setIsConfirmPasswordShown(show => !show)

  const onSubmit: SubmitHandler<FormData> = async (data: FormData) => {
    // Clear any previous generic errors
    setGenericError(null)

    if (data.password !== data.confirmPassword) {
      setError('confirmPassword', {
        type: 'manual',
        message: 'Passwords do not match'
      })
      return
    }

    setIsSubmitting(true)

    try {
      const success = await registerAction(
        {
          firstName: data.firstName,
          lastName: data.lastName,
          emailID: data.emailID,
          phoneNo: data.phoneNo,
          password: data.password,
          subscribeNewsletter: data.subscribeNewsletter,
          agreePolicy: data.agreePolicy
        },
        router,
        'client'
      )


      if (!success) {
        // toast.error('Registration failed. Please try again.')
      }
    } catch (error) {
      setGenericError('An unexpected error occurred. Please try again later.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className='flex justify-center items-center min-bs-[100dvh] is-full relative p-6'>
      <Card className='flex flex-col sm:is-[460px]'>
        <CardContent className='p-3 sm:!p-6'>
          <Link href={'/'} className='flex justify-center items-center mbe-6'>
            <img height={60} src='/images/AYAS-logo-square.png' alt='logo' />
          </Link>
          <div className='flex flex-col gap-5'>
            <div>
              {/* <Typography variant='h5'>Create Account</Typography> */}
              <Typography className='mbs-1'>Please fill all the required fields to register</Typography>
            </div>

            <form
              noValidate
              autoComplete='off'
              onSubmit={handleSubmit(onSubmit)}
              className='flex flex-col gap-5'
            >

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">


                <Controller
                  name='firstName'
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label='First Name'
                      error={Boolean(errors.firstName)}
                      helperText={errors.firstName?.message}
                    />
                  )}
                />


                <Controller
                  name='lastName'
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label='Last Name'
                      error={Boolean(errors.lastName)}
                      helperText={errors.lastName?.message}
                    />
                  )}
                />


                <Controller
                  name='emailID'
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      type='email'
                      label='Email ID'
                      error={Boolean(errors.emailID)}
                      helperText={errors.emailID?.message}
                    />
                  )}
                />

                <Controller
                  name='phoneNo'
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label='Phone No'
                      error={Boolean(errors.phoneNo)}
                      helperText={errors.phoneNo?.message}
                    />
                  )}
                />

                <Controller
                  name='password'
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <TextField
                      {...field}
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
                                edge='end'
                                onClick={handleClickShowPassword}
                                onMouseDown={e => e.preventDefault()}
                                aria-label='toggle password visibility'
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
                  rules={{ required: true }}
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
                                edge='end'
                                onClick={handleClickShowConfirmPassword}
                                onMouseDown={e => e.preventDefault()}
                                aria-label='toggle confirm password visibility'
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


              </div>

              <Box>
                <Controller
                  name='agreePolicy'
                  control={control}
                  rules={{ required: true }}
                  render={({ field: { onChange, value, ...field } }) => (
                    <FormControlLabel
                      sx={{
                        alignItems: 'center',
                        '& .MuiFormControlLabel-label': {
                          fontSize: '0.875rem',
                          color: 'text.secondary'
                        }
                      }}
                      control={
                        <Checkbox
                          onChange={e => onChange(e.target.checked ? 'agreed' : '')}
                          checked={Boolean(value)}
                          {...field}
                        />
                      }
                      label={
                        <Typography variant="body2" color="text.secondary">
                          I agree with the{' '}
                          <Typography
                            component="span"
                            variant="body2"
                            sx={{
                              cursor: 'pointer',
                              color: 'primary.main',
                              '&:hover': {
                                color: 'primary.dark'
                              }
                            }}
                            onClick={(e) => {
                              e.preventDefault();
                              setPolicyDialogOpen(true);
                            }}
                          >
                            cancellation policy
                          </Typography>
                        </Typography>
                      }
                    />
                  )}
                />
                {errors.agreePolicy && (
                  <FormHelperText error>{errors.agreePolicy.message}</FormHelperText>
                )}
              </Box>

              <Box>
                <Controller
                  name='subscribeNewsletter'
                  control={control}
                  render={({ field: { onChange, value, ...field } }) => (
                    <FormControlLabel
                      sx={{
                        alignItems: 'flex-start',
                        '& .MuiCheckbox-root': {
                          paddingTop: '0',
                          marginTop: '2px'
                        },
                        '& .MuiFormControlLabel-label': {
                          fontSize: '0.875rem',
                          color: 'text.secondary'
                        }
                      }}
                      control={
                        <Checkbox
                          onChange={e => onChange(e.target.checked ? 'subscribed' : '')}
                          checked={Boolean(value)}
                          {...field}
                        />
                      }
                      label='Subscribe to be one of the first to receive our promotions, cool offers and get other relevant information'
                    />
                  )}
                />
              </Box>

              <Button
                fullWidth
                variant='contained'
                type='submit'
                disabled={isSubmitting || !agreePolicy}
              >
                {isSubmitting ? 'Signing up...' : 'Sign up'}
              </Button>


              <div className='flex justify-center items-center flex-wrap gap-2'>
                <Typography>Already have an account?</Typography>
                <Typography component={Link} href='/client/login' color='primary.main'>
                  Sign in instead
                </Typography>
              </div>
            </form>
          </div>
        </CardContent>
      </Card>
      <img src={authBackground} className='absolute bottom-[5%] z-[-1] is-full max-md:hidden' />
      <Dialog
        open={policyDialogOpen}
        onClose={() => setPolicyDialogOpen(false)}
        aria-labelledby="cancellation-policy-dialog-title"
        aria-describedby="cancellation-policy-dialog-description"
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle id="cancellation-policy-dialog-title">
          Cancellation Policy
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ p: 1 }}>
            <Typography variant="body2" gutterBottom>
              If you need to cancel a scheduled service, you need to provide AYAS with 72 hours notice prior
              to the commencement of the scheduled service.
            </Typography>
            <Typography variant="body2" gutterBottom>
              If you cancel after this time, it is my right to charge a cancellation fee. AYAS cancellation fee is:
            </Typography>
            <Box component="ul" sx={{ pl: 2, mt: 1 }}>
              <Box component="li" sx={{ mb: 1 }}>
                <Typography variant="body2">
                  A maximum of 50% of the hourly agreed upon rate where the scheduled service is
                  charged at for the agreed upon hours.
                </Typography>
              </Box>
              <Box component="li">
                <Typography variant="body2">
                  Any agreed expenses incurred by me in preparing to provide my services to you e.g.
                  the pre-purchase of tickets for an event.
                </Typography>
              </Box>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPolicyDialogOpen(false)} color="primary" sx={{ marginTop: '10px' }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}

export default ClientRegister
