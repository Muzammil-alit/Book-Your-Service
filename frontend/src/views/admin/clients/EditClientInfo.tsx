'use client'

// React Imports
import React, { useState } from 'react'

// MUI Imports
import Dialog from '@mui/material/Dialog'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import IconButton from '@mui/material/IconButton'
import { Checkbox, FormControlLabel, Grid } from '@mui/material'
import { UserType } from '@/types/apps/userTypes'
import { Controller, useForm } from 'react-hook-form'
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useDispatch } from 'react-redux'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'

import { getClientApiCall, updateClientApiCall } from '@/views/client/profile/actions'


type EditClientInfoProps = {
  open: boolean
  setOpen: (open: boolean) => void
  userID: number
  setData: (data: UserType[]) => void
  fetchBookings: () => void
}

type FormValidateType = {
  userID?: number,
  firstName: string
  lastName: string
  emailID: string
  phoneNumber: string
  active?: boolean
  updatedOn?: string;
  password?: string;
  confirmPassword?: string;
  changePassword?: boolean,
}

const schema = yup.object().shape({
  firstName: yup
    .string()
    .max(50, 'First name must be at most 50 characters')
    .required('First name is required'),

  lastName: yup
    .string()
    .max(50, 'Last name must be at most 50 characters')
    .required('Last name is required'),

  emailID: yup
    .string()
    .required('Email is required')
    .email('Please enter a valid email address')
    .max(50, 'Email must be at most 50 characters'),

  phoneNumber: yup
    .string()
    .required('Phone number is required')
    .matches(/^[0-9]{10}$/, 'Phone number must be 10 digits'),


  active: yup.boolean(),

});


const EditClientInfo = ({ open, setOpen, userID, fetchBookings }: EditClientInfoProps) => {

  type UserData = {
    FirstName: string;
    LastName: string;
    EmailID: string;
    PhoneNo?: string;
    Active?: boolean;
    UpdatedOn?: string;
  };

  const [user, setUser] = useState<UserData | {}>({})

  const dispatch = useDispatch()

  React.useEffect(() => {
    const fetchUserData = async () => {
      if (userID) {
        try {
          const user = await getClientApiCall(userID);
          const data = user?.data?.data

          // Assert the type of data before using
          type UserData = {
            FirstName: string;
            LastName: string;
            EmailID: string;
            PhoneNo?: string;
            Active?: boolean;
            UpdatedOn?: string;
          };

          const typedData = data as UserData;

          setUser(typedData)

          resetForm({
            firstName: typedData.FirstName,
            lastName: typedData.LastName,
            emailID: typedData.EmailID,
            phoneNumber: typedData.PhoneNo || '',
            active: typedData.Active ?? false,
            updatedOn: typedData.UpdatedOn
          });
        } catch (err) {
          console.error("Error fetching user data:", err);
        }
      }
    };

    fetchUserData();
  }, [open]);

  const {
    control,
    reset: resetForm,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<FormValidateType>({
    resolver: yupResolver(schema),
    defaultValues: {
      firstName: '',
      lastName: '',
      emailID: '',
      phoneNumber: '',
      password: '',
      confirmPassword: '',
      active: false,
      changePassword: false,
    },
  });
  const changePassword = watch('changePassword');

  React.useEffect(() => {
    if (!changePassword) {
      setValue('password', '');
      setValue('confirmPassword', '');
    }
  }, [changePassword, setValue]);

  const onSubmit = (formData: FormValidateType) => {



    const newUser: UserType = {

      firstName: formData.firstName,
      lastName: formData.lastName!,
      emailID: formData.emailID,
      phoneNumber: formData.phoneNumber,
      active: formData.active ?? false,
      updatedOn: (user as UserData).UpdatedOn,
    }

      

    updateClientApiCall(userID, newUser, dispatch, () => {
      handleClose();
      fetchBookings()
      resetForm({
        firstName: '',
        lastName: '',
        emailID: '',
        phoneNumber: '',
        active: false
      })
    })
  }


  const handleClose = () => {
    resetForm({
      firstName: '',
      lastName: '',
      emailID: '',
      phoneNumber: '',
      password: '',
      confirmPassword: '',
      changePassword: false,
      active: false
    });
    setOpen(false)
  }

  const handleReset = () => {
    handleClose()
  }




  return (
    <Dialog fullWidth open={open} onClose={handleClose} maxWidth='sm' scroll='body' closeAfterTransition={false}>
      <DialogTitle className='flex items-center justify-between px-6 pb-2 pt-4'>
        <Typography variant='h5'>Edit Client</Typography>
        <IconButton size='small' onClick={handleReset}>
          <i className='ri-close-line text-2xl' />
        </IconButton>
      </DialogTitle>
      <Divider />

      <form onSubmit={handleSubmit(data => onSubmit(data))}>
        <DialogContent className="overflow-visible">
          <Grid container spacing={2}>
            {/* First Name & Last Name in one row */}
            <Grid item xs={12} sm={6}>
              <Controller
                name="firstName"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="First Name"
                    error={!!errors.firstName}
                    helperText={errors.firstName?.message || ' '}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="lastName"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Last Name"
                    error={!!errors.lastName}
                    helperText={errors.lastName?.message || ' '}
                  />
                )}
              />
            </Grid>


            {/* Phone Number */}
            <Grid item xs={12} sm={6}>
              <Controller
                name="phoneNumber"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Phone Number"
                    error={!!errors.phoneNumber}
                    helperText={errors.phoneNumber?.message || ' '}
                    inputProps={{ maxLength: 10 }}
                  />
                )}
              />
            </Grid>



            {/* Email */}
            <Grid item xs={12} sm={6} >
              <Controller
                name="emailID"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    type="email"
                    label="Email"
                    error={!!errors.emailID}
                    helperText={errors.emailID?.message || ' '}
                  />
                )}
              />
            </Grid>




            {/* Active Checkbox */}
            <Grid item xs={12}>
              <Controller
                name="active"
                control={control}
                defaultValue={false}
                render={({ field }) => (
                  <FormControlLabel
                    control={
                      <Checkbox
                        {...field}
                        checked={field.value}
                        onChange={(e) => field.onChange(e.target.checked)}
                      />
                    }
                    label="Active"
                  />
                )}
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions className="flex items-center justify-between mt-4">
          <Button type="submit" variant="contained" color="primary">
            Save
          </Button>
          <Button variant="outlined" color="error" onClick={handleClose}>
            Cancel
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

export default EditClientInfo