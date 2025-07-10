import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import {
  Box,
  Button,
  Drawer,
  IconButton,
  Typography,
  TextField,
  Divider
} from '@mui/material'
import { Icon } from '@iconify/react'
import { useAppSelector } from '@/redux/useAppSelector'
import { getUserByIdApiCall, updateUserApiCall } from '@/views/admin/user/action'
import { toast } from 'react-toastify'
import { updateProfile } from '@/redux/slices/login'

import { useEffect } from 'react'


interface UpdateProfileSideModalProps {
  open: boolean
  onClose: () => void
}


const schema = yup.object().shape({
  firstName: yup
    .string()
    .min(2, 'First name must be at least 2 characters')
    .required('First name is required'),

  lastName: yup
    .string()
    .min(2, 'Last name must be at least 2 characters')
    .required('Last name is required'),

  emailID: yup
    .string()
    .email('Please enter a valid email address')
    .required('Email is required')
    .test('valid-email', 'Please enter a valid email address', value => {
      if (!value) return false;
      const atIndex = value.indexOf('@');
      const dotIndex = value.lastIndexOf('.');
      return atIndex > 0 && dotIndex > atIndex + 1 && dotIndex < value.length - 1;
    })
    .test(
      'valid-global-domain',
      'Email must end with a valid domain name',
      value => {
        if (!value) return false;
        // Match TLDs like .com, .org, .io — must be only letters, 2 or more characters
        return /\.[a-zA-Z]{2,}$/.test(value);
      }
    ),

  phoneNumber: yup
    .string()
    .nullable()
});


const UpdateProfileSideModal = ({ open, onClose }: UpdateProfileSideModalProps) => {
  const dispatch = useDispatch()
  const userType = sessionStorage.getItem('userType')
  const user = (userType === "1") ? useAppSelector((state: any) => state.authReducer.admin.user) : useAppSelector((state: any) => state.authReducer.carer.user)

  
  interface UserByApi {
    FirstName?: string
    LastName?: string
    EmailID?: string
    UpdatedOn?: string
    // Add other fields as needed
  }
  
  const [userbyapi, setUserbyapi] = useState<UserByApi | null>(null)

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      firstName: '',
      lastName: '',
      emailID: '',
    }
  })

  const fetchUserData = async () => {
    if (user?.userID) {
      try {
        const userdata = await getUserByIdApiCall(user?.userID);
        setUserbyapi(userdata);
      } catch (err) {
        console.error("Error fetching user data:", err);
      }
    }
  };

  useEffect(() => {
    if (open) {
      fetchUserData();
    } else {
      reset({
        firstName: '',
        lastName: '',
        emailID: '',
      })
    }
  }, [open]);

  useEffect(() => {
    if (userbyapi) {
      reset({
        firstName: userbyapi?.FirstName || '',
        lastName: userbyapi?.LastName || '',
        emailID: userbyapi?.EmailID || '',
      })
    }
  }, [userbyapi, reset]);

  const onSubmit = async (data: any) => {
    try {
      const userData = {
        firstName: data.firstName,
        lastName: data.lastName,
        emailID: data.emailID,
        userID: user?.userID,
        updatePassword: false,
        password: null,
        active: true,
        updatedOn: userbyapi?.UpdatedOn,
      }
      await updateUserApiCall(userData, dispatch, () => {
        dispatch(updateProfile({
          firstName: data.firstName,
          lastName: data.lastName,
          emailID: data.emailID,
        }))
        onClose()
      })
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('Failed to update profile. Please try again.')
    }
  }


  return (
    <Drawer
      open={open}
      anchor='right'
      variant='temporary'
      onClose={onClose}
      ModalProps={{ keepMounted: true }}
      sx={{ '& .MuiDrawer-paper': { width: { xs: 300, sm: 400 } } }}
    >
      <Box className='flex items-center justify-between pli-5 plb-4'>
        <Typography variant='h5'>Update Profile</Typography>
        <IconButton size='small' onClick={onClose}>
          <Icon icon='ri:close-line' className='text-2xl' />
        </IconButton>
      </Box>
      <Divider />
      <Box className='p-5'>
        <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-5'>
          <Controller
            name='firstName'
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label='First Name'
                error={!!errors.firstName}
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
                error={!!errors.lastName}
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
                label='Email'
                error={!!errors.emailID}
                helperText={errors.emailID?.message}
              />
            )}
          />
          <Button
            type='submit'
            variant='contained'
            color='primary'
            className='mt-4'
          >
            Update Profile
          </Button>
        </form>
      </Box>
    </Drawer>
  )
}

export default UpdateProfileSideModal 