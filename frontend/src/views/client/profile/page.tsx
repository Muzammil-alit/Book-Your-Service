'use client'

import React, { useEffect, useState } from 'react'
import {
  Box,
  Container,
  Typography,
  Grid,
  Avatar,
  Button,
  Paper,
  Backdrop,
  TextField,
  Modal,
  Fade,
} from '@mui/material';
import Link from 'next/link'
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '@/redux/store'
import { styled } from '@mui/material/styles'
import Image from 'next/image'
import { deleteAccountApiCall, getClientApiCall, updateClientApiCall } from './actions'
import { useForm, Controller } from 'react-hook-form'
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import { ClientType } from '@/types/apps/clientTypes'
import { useAppSelector } from '@/redux/useAppSelector'
import IconButton from '@mui/material/IconButton'
import { Checkbox, FormControlLabel, InputAdornment } from '@mui/material'
import { useRouter } from 'next/navigation'

import { updateProfile } from '@/redux/slices/login'

import { logout } from '@/views/auth/action'

import { logoutfn } from '@/redux/slices/login';
import { getMyBookingsApiCall } from '../booking/actions';
import { toast } from 'react-toastify';







const ModalContent = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '90%',
  maxWidth: '600px',
  padding: 0,
  boxShadow: '0 24px 48px rgba(0, 0, 0, 0.2)',
  borderRadius: '16px',
  outline: 'none',
  overflow: 'hidden',
  background: 'white',
}))

const ModalBody = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  maxHeight: 'calc(100vh - 200px)',
  overflowY: 'auto',
}))





const GlassPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  display: 'flex',
  flexDirection: 'column',
  background: 'rgba(255, 255, 255, 0.7)',
  backdropFilter: 'blur(10px)',
  WebkitBackdropFilter: 'blur(10px)',
  borderRadius: '16px',
  border: '1px solid rgba(255, 255, 255, 0.18)',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
  transition: 'all 0.3s ease',
  position: 'relative',
  overflow: 'hidden',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 15px 30px rgba(0, 0, 0, 0.15)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    background: 'linear-gradient(90deg, #4caf50 0%, #2e7d32 100%)',
    opacity: 0,
    transition: 'opacity 0.3s ease',
  },
  '&:hover::before': {
    opacity: 1,
  }
}))

const ProfileHeader = styled(GlassPaper)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  marginBottom: theme.spacing(4),
  padding: theme.spacing(4),
  animation: 'fadeIn 0.6s ease-out',
  '@keyframes fadeIn': {
    '0%': {
      opacity: 0,
      transform: 'translateY(10px)'
    },
    '100%': {
      opacity: 1,
      transform: 'translateY(0)'
    }
  }
}))

const AnimatedBox = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'delay'
})<{ delay?: number }>(({ theme, delay = 0 }) => ({
  animation: `fadeInUp 0.5s ease-out ${delay}s both`,
  '@keyframes fadeInUp': {
    '0%': {
      opacity: 0,
      transform: 'translateY(20px)'
    },
    '100%': {
      opacity: 1,
      transform: 'translateY(0)'
    }
  }
}))

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: '12px',
    transition: 'all 0.3s ease',
    background: 'rgba(255, 255, 255, 0.5)',
    border: '1px solid rgba(255, 255, 255, 0.18)',
    '&:hover': {
      background: 'rgba(255, 255, 255, 0.7)',
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.05)',
      border: '1px solid rgba(255, 255, 255, 0.3)',
    },
    '&.Mui-focused': {
      background: 'rgba(255, 255, 255, 0.9)',
      boxShadow: '0 4px 12px rgba(76, 175, 80, 0.15)',
      border: '1px solid rgba(76, 175, 80, 0.3)',
    }
  }
}))

const SaveButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(4),
  borderRadius: '12px',
  padding: theme.spacing(1.5, 4),
  textTransform: 'none',
  fontWeight: 500,
  background: 'linear-gradient(90deg, #4caf50 0%, #2e7d32 100%)',
  color: '#fff',
  transition: 'all 0.3s ease',
  position: 'relative',
  overflow: 'hidden',
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(255, 255, 255, 0.1)',
    opacity: 0,
    transition: 'opacity 0.3s ease',
  },
  '&:hover': {
    boxShadow: '0 4px 12px rgba(76, 175, 80, 0.4)',
    transform: 'translateY(-2px)'
  },
  '&:hover::after': {
    opacity: 1,
  }
}))

const HighlightText = styled('span')(({ theme }) => ({
  background: 'linear-gradient(90deg, #4caf50 0%, #2e7d32 100%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
  textFillColor: 'transparent',
}))



interface Booking {
  BookingID: number;
  BookingDateTime: string;
  BookingStatus: number;
  // ... other properties
}

function countPendingAndUpcomingBookings(bookings: any[]): {
  pendingCount: number;
  upcomingCount: number;
} {
  const now = new Date();

  const pendingBookings = bookings.filter(booking => {
    return booking.BookingStatus === 0;
  });

  const upcomingBookings = bookings.filter(booking => {
    const bookingDate = new Date(booking.BookingDateTime);
    return booking.BookingStatus === 1 && bookingDate > now;
  });

  return {
    pendingCount: pendingBookings.length,
    upcomingCount: upcomingBookings.length
  };
}


const ClientProfilePage = () => {
  const auth = useSelector((state: RootState) => state?.authReducer?.client)
  const user = auth?.user as any
  const router = useRouter()


  const [isPasswordShown, setIsPasswordShown] = useState(false);
  const [isConfirmPasswordShown, setIsConfirmPasswordShown] = useState(false);


  const handleClickShowPassword = () => setIsPasswordShown(show => !show);
  const handleClickShowConfirmPassword = () => setIsConfirmPasswordShown(show => !show);


  const [prevData, setPrevData] = useState<ClientType | null>(null)

  const dispatch = useDispatch()
  const clientID = useAppSelector((state) => state?.authReducer?.client?.user?.clientID)
  const userID = useAppSelector((state) => state?.authReducer?.client?.user?.userID)

  type FormValidateType = {
    firstName: string
    lastName: string
    emailID: string
    phoneNumber: string

    FirstName: string
    LastName: string
    EmailID: string
    changePassword: boolean
    password: string
    confirmPassword: string
  }

  const schema = yup.object().shape({
    firstName: yup.string().required('First name is required').max(50),
    lastName: yup.string().max(50),
    emailID: yup.string().required('Email is required').email("Please enter a valid email").max(50),
    phoneNumber: yup
      .string()
      .required('Phone number is required')
      .min(7, 'Phone number must be at least 7 characters')
      .max(15, 'Phone number must not exceed 15 characters'),


    changePassword: yup.boolean(),

    password: yup
      .string()
      .when('changePassword', {
        is: true,
        then: (schema) =>
          schema
            .required('Password is required')
            .min(8, 'Password must be at least 8 characters long')
            .max(18, 'Password must be at most 18 characters long'),
        otherwise: (schema) => schema.notRequired(),
      }),

    confirmPassword: yup
      .string()
      .when('changePassword', {
        is: true,
        then: (schema) =>
          schema
            .required('Confirm Password is required')
            .oneOf([yup.ref('password')], 'The passwords do not match.'),
        otherwise: (schema) => schema.notRequired(),
      }),


  })

  type FormValidate = yup.InferType<typeof schema>

  const {
    control,
    reset,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm<FormValidate>({
    resolver: yupResolver(schema),
    defaultValues: {
      firstName: '',
      lastName: '',
      emailID: '',
      phoneNumber: '',

      changePassword: false,
      password: '',
      confirmPassword: ''
    }
  })

  const changePassword = watch('changePassword');




  React.useEffect(() => {
    if (!changePassword) {
      setValue('password', '');
      setValue('confirmPassword', '');
    }
  }, [changePassword, setValue]);

  useEffect(() => {
    const fetchClient = async () => {
      try {
        const res = await getClientApiCall(clientID)
        const data = res?.data?.data as any
        setPrevData(data)

        if (data) {
          reset({
            firstName: data?.FirstName || '',
            lastName: data?.LastName || '',
            emailID: data?.EmailID || '',
            phoneNumber: data?.PhoneNo || '',
          })
        }
      } catch (error) {
        console.error('Failed to fetch client:', error)
      }
    }

    fetchClient()
  }, [clientID, reset])

  const onSubmit = (formData: FormValidateType) => {


    const formdata = {
      ...formData,
      updatedOn: prevData.UpdatedOn,
      active: true,
    }

    updateClientApiCall(clientID, formdata, dispatch, () => {
      dispatch(updateProfile({
        firstName: formdata.firstName,
        lastName: formdata.lastName,
        emailID: formdata.emailID,
      }))
      router.push('/client/dashboard')
    });




  }

  const handleUserLogout = async () => {
    try {

      logout(router);
      dispatch(logoutfn(2));

    } catch (error) {
      console.error(error)
    }
  }


  const [deleteModalOpen, setDeleteTextModalOpen] = useState(false)

  const [reason, setReason] = useState('')
  const [deleteText, setDeleteText] = useState('')
  const [deleteErrors, setDeleteTextErrors] = useState({ reason: false, deleteText: false })

  const [booking, setBooking] = useState<{ pendingCount: number; upcomingCount: number }>({
    pendingCount: 0,
    upcomingCount: 0,
  });


  const handleDeleteAccount = async () => {
    setDeleteTextModalOpen(true)

  }


  const handleDeleteConfirm = async () => {
    const reasonError = reason.trim() === '';
    const deleteError = deleteText.trim().toLowerCase() !== 'delete';

    setDeleteTextErrors({ reason: reasonError, deleteText: deleteError });

    if (!reasonError && !deleteError) {


      try {
        const result = await deleteAccountApiCall(clientID, userID, reason)
        if (result?.isOk) {
          handleCloseModal();

          let countdown = 3;

          const countdownToastId = toast.success(`Account deleted successfully, Logging out in ${countdown}...`, {
            autoClose: false,
            closeButton: false,
            draggable: false,
          });

          const interval = setInterval(() => {
            countdown -= 1;

            if (countdown > 0) {
              toast.update(countdownToastId, {
                render: `Account deleted successfully, Logging out in ${countdown}...`,
              });
            } else {
              toast.dismiss(countdownToastId);
              clearInterval(interval);
              handleUserLogout();
            }
          }, 1000);
        }
      }

      catch (err) {

      }



    }
  };


  const handleCloseModal = () => {
    setDeleteTextModalOpen(false);
    setReason('')
    setDeleteText('')
  };

  const fetchBookings = async () => {
    try {
      const apiBookings = await getMyBookingsApiCall(clientID) as any;

      setBooking(countPendingAndUpcomingBookings(apiBookings)); // Update state with fetched data
    } catch (error) {

    }
  };


  // Fetch bookings data from API
  useEffect(() => {
    fetchBookings();
  }, [deleteModalOpen]);


  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <Container maxWidth="md" >
          <AnimatedBox delay={0.1}>
            <Box sx={{ mb: 4, display: 'flex', alignItems: 'center' }}>
              <Link href="/client/dashboard" passHref style={{ textDecoration: 'none' }}>
                <Button
                  variant="outlined"
                  color="primary"
                  size="small"
                  startIcon={<i className="ri-arrow-left-line" />}
                >
                  Back to Dashboard
                </Button>
              </Link>
            </Box>
          </AnimatedBox>

          <ProfileHeader>
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column-reverse', sm: 'row' }, // Stack on mobile, row on tablet+
                justifyContent: 'space-between',
                alignItems: { xs: 'flex-start', sm: 'flex-start' },
                gap: { xs: 3, sm: 0 }, // Add gap between items on mobile
              }}
            >
              {/* Left side - Text content */}
              <Box sx={{
                width: { xs: '100%', sm: 'auto' },
                textAlign: { xs: 'center', sm: 'left' }
              }}>
                <Typography variant="h4" fontWeight={600}>
                  My <HighlightText>Profile</HighlightText>
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
                  Manage your personal information and preferences
                </Typography>

                <Box sx={{
                  display: 'flex',
                  flexDirection: { xs: 'column', sm: 'row' },
                  gap: 2,
                  mt: { xs: 4, sm: 6 },
                  justifyContent: { xs: 'center', sm: 'flex-start' }
                }}>
                  <Button
                    onClick={handleDeleteAccount}
                    variant="outlined"
                    color="error"
                    size="small"
                    sx={{
                      alignSelf: 'center',
                      width: { xs: '60%', sm: '100%' } // Full width on mobile
                    }}
                  >
                    Delete My Account
                  </Button>
                  <Button
                    onClick={handleUserLogout}
                    variant="outlined"
                    color="error"
                    size="small"
                    sx={{
                      alignSelf: 'center',
                      width: { xs: '60%', sm: '100%' } // Full width on mobile
                    }}
                  >
                    Logout
                  </Button>
                </Box>
              </Box>

              {/* Right side - Image */}
              <Box sx={{
                alignSelf: { xs: 'center', sm: 'flex-start' },
                mb: { xs: 2, sm: 0 }
              }}>
                <Image
                  src="/images/illustrations/characters/7.png"
                  alt="Profile illustration"
                  width={90}
                  height={120}
                  style={{
                    objectFit: 'contain',
                    maxWidth: '100%',
                    height: 'auto'
                  }}
                />
              </Box>
            </Box>
          </ProfileHeader>

          <AnimatedBox delay={0.2}>
            <GlassPaper>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                <Avatar
                  sx={{
                    width: 80,
                    height: 80,
                    bgcolor: 'rgba(76, 175, 80, 0.1)',
                    color: '#4caf50',
                    border: '4px solid rgba(76, 175, 80, 0.2)',
                    fontSize: '2rem',
                    mr: 3
                  }}
                >
                  {user.firstName ? `${user.firstName.charAt(0)}${user.lastName?.charAt(0)}` : 'U'}
                </Avatar>
                <Box>
                  <Typography variant="h5" fontWeight={500}>{user.firstName} {user.lastName}</Typography>
                  <Typography variant="body2" color="text.secondary">{user.emailID}</Typography>
                </Box>
              </Box>

              <Typography variant="h6" sx={{ mb: 3 }}>Personal Information</Typography>

              <Grid container spacing={6}>
                <Grid item xs={12} sm={6}>
                  <Controller
                    name="firstName"
                    control={control}
                    render={({ field }) => (
                      <StyledTextField
                        {...field}
                        fullWidth
                        label="First Name"
                        error={!!errors.firstName}
                        helperText={errors.firstName?.message}
                        InputProps={{
                          startAdornment: <i className="ri-user-line" style={{ marginRight: '10px', color: '#4caf50' }} />
                        }}
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Controller
                    name="lastName"
                    control={control}
                    render={({ field }) => (
                      <StyledTextField
                        {...field}
                        fullWidth
                        label="Last Name"
                        error={!!errors.lastName}
                        helperText={errors.lastName?.message}
                        InputProps={{
                          startAdornment: <i className="ri-user-line" style={{ marginRight: '10px', color: '#4caf50' }} />
                        }}
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Controller
                    name="emailID"
                    control={control}
                    render={({ field }) => (
                      <StyledTextField
                        {...field}
                        fullWidth
                        label="Email"
                        error={!!errors.emailID}
                        helperText={errors.emailID?.message}
                        InputProps={{
                          startAdornment: <i className="ri-mail-line" style={{ marginRight: '10px', color: '#4caf50' }} />
                        }}
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Controller
                    name="phoneNumber"
                    control={control}
                    render={({ field }) => (
                      <StyledTextField
                        {...field}
                        fullWidth
                        label="Phone Number"
                        error={!!errors.phoneNumber}
                        helperText={errors.phoneNumber?.message}
                        InputProps={{
                          startAdornment: <i className="ri-phone-line" style={{ marginRight: '10px', color: '#4caf50' }} />
                        }}
                      />
                    )}
                  />
                </Grid>


                <Grid item sm={12}>
                  <Controller
                    name='changePassword'
                    control={control}
                    render={({ field }) => (
                      <FormControlLabel
                        control={<Checkbox {...field} checked={field.value} />}
                        label='Do you want to change the password?'
                      />
                    )}
                  />
                </Grid>


                <Modal
                  open={deleteModalOpen}
                  onClose={handleCloseModal}
                  BackdropComponent={Backdrop}
                  BackdropProps={{
                    timeout: 500,
                  }}
                >
                  <Fade in={deleteModalOpen}>
                    <ModalContent>
                      <>

                        <ModalBody>
                          <Box sx={{ mb: 3, mx: 2 }}>
                            <Typography variant="h5" className="text-start font-semibold text-red-600" fontWeight={500} gutterBottom>
                              Delete My Account
                            </Typography>
                            <Typography variant="body1" className="text-start" fontWeight={500} gutterBottom>
                              This action cannot be undone and you will lose all of your data
                            </Typography>
                            <Typography variant="body1" className="text-start" fontWeight={500} gutterBottom>
                              {booking.pendingCount} Pending bookings <br />
                              {booking.upcomingCount}  Upcoming bookings
                            </Typography>
                            {booking.upcomingCount > 0 &&
                              <Typography variant="body1" className="text-start" fontWeight={500} gutterBottom>
                                You have upcoming bookings. If you continue to delete account, these bookings will be cancelled.
                              </Typography>
                            }
                            <Typography variant="body1" className="text-start mb-4" fontWeight={500} gutterBottom>
                              Are you sure, do you still want to delete your account?
                            </Typography>

                            <TextField
                              className="mb-4"
                              onChange={(e) => setReason(e.target.value)}
                              value={reason}
                              fullWidth
                              label="Reason of account deletion"
                              multiline
                              rows={4}
                              variant="outlined"
                              error={deleteErrors.reason}
                              helperText={deleteErrors.reason ? 'Reason is required' : ''}
                            />

                            <TextField
                              onChange={(e) => setDeleteText(e.target.value)}
                              value={deleteText}
                              fullWidth
                              label="Type DELETE"
                              variant="outlined"
                              error={deleteErrors.deleteText}
                              helperText={deleteErrors.deleteText ? 'You must type DELETE (case-insensitive)' : ''}
                            />
                          </Box>

                          <Box sx={{ display: 'flex', justifyContent: 'center', mx: 2, mt: 6, mb: 0 }}>
                            <Button variant="outlined" color="primary" onClick={handleDeleteConfirm} sx={{ mx: 4 }}>
                              Confirm
                            </Button>
                            <Button variant="outlined" color="error" onClick={handleCloseModal} sx={{ mx: 4 }}>
                              Cancel
                            </Button>
                          </Box>
                        </ModalBody>
                      </>
                    </ModalContent>
                  </Fade>


                </Modal>





                {changePassword && (
                  <>

                    <Grid item xs={12} sm={6}>

                      <Controller
                        name="password"
                        control={control}
                        // rules={{ required: "Password is required" }}
                        render={({ field }) => (
                          <StyledTextField
                            {...field}
                            fullWidth
                            label="Password"
                            type={isPasswordShown ? "text" : "password"}
                            InputProps={{
                              endAdornment: (
                                <InputAdornment position="end">
                                  <IconButton
                                    edge="end"
                                    onClick={handleClickShowPassword}
                                    onMouseDown={(e) => e.preventDefault()}
                                    aria-label="toggle password visibility"
                                  >
                                    <i className={isPasswordShown ? "ri-eye-off-line" : "ri-eye-line"} />
                                  </IconButton>
                                </InputAdornment>
                              ),
                            }}
                            error={!!errors.password}
                            helperText={errors.password?.message}
                          />
                        )}
                      />

                    </Grid>


                    <Grid item xs={12} sm={6}>
                      <Controller
                        name="confirmPassword"
                        control={control}
                        // rules={{
                        //   required: "Confirm Password is required",
                        //   validate: (value) =>
                        //     value === watch("password") || "Passwords do not match",
                        // }}
                        render={({ field }) => (
                          <StyledTextField
                            {...field}
                            fullWidth
                            label="Confirm Password"
                            type={isConfirmPasswordShown ? "text" : "password"}
                            InputProps={{
                              endAdornment: (
                                <InputAdornment position="end">
                                  <IconButton
                                    edge="end"
                                    onClick={handleClickShowConfirmPassword}
                                    onMouseDown={(e) => e.preventDefault()}
                                    aria-label="toggle confirm password visibility"
                                  >
                                    <i className={isConfirmPasswordShown ? "ri-eye-off-line" : "ri-eye-line"} />
                                  </IconButton>
                                </InputAdornment>
                              ),
                            }}
                            error={!!errors.confirmPassword}
                            helperText={errors.confirmPassword?.message}
                          />
                        )}
                      />

                    </Grid>


                  </>

                )}


              </Grid>

              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <SaveButton type="submit" variant="contained">Save</SaveButton>
              </Box>
            </GlassPaper>
          </AnimatedBox>
        </Container>
      </div>


    </form>
  )
}

export default ClientProfilePage
