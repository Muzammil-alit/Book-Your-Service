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
import { Checkbox, FormControlLabel, Grid, InputAdornment } from '@mui/material'
import { UserType } from '@/types/apps/userTypes'
import { Controller, useForm } from 'react-hook-form'
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { getAllUsersApiCall, getUserByIdApiCall, updateUserApiCall } from './action'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import { updateProfile } from '@/redux/slices/login'



type EditUserInfoProps = {
  open: boolean
  setOpen: (open: boolean) => void
  userID: number
  setData: (data: UserType[]) => void
}

type FormValidateType = {
  userID?: number,
  firstName: string
  lastName: string
  emailID: string
  active?: boolean
  password?: string
  confirmPassword?: string;
  changePassword?: boolean;
  updatedOn?: string;
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
    .email('Invalid email format')
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

  active: yup.boolean(),

  changePassword: yup.boolean(),

  password: yup
    .string()
    .when('changePassword', {
      is: true,
      then: (schema) =>
        schema
          .required('Password is required')
          .min(8, 'Password must be at least 8 characters long')
          .max(50, 'Password must be at most 50 characters long')
          .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
          .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
          .matches(/\d/, 'Password must contain at least one number')
          .matches(/[!@#$%^&*()\-_=+{};:,<.>]/, 'Password must contain at least one special character'),
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
});


const EditUserInfo = ({ open, setOpen, userID }: EditUserInfoProps) => {

  const dispatch = useDispatch();
  const loggedInUser = useSelector((state: any) => state.authReducer.admin.user);

  // States
  const [isPasswordShown, setIsPasswordShown] = useState(false);
  const [isConfirmPasswordShown, setIsConfirmPasswordShown] = useState(false);

  const [user, setUser] = useState<Partial<UserType>>({})



  React.useEffect(() => {
    const fetchUserData = async () => {
      if (userID) {
        try {
          const user = await getUserByIdApiCall(userID);


          setUser(user)
          resetForm({
            firstName: user.FirstName,
            lastName: user.LastName,
            emailID: user.EmailID,
            password: '',
            confirmPassword: '',
            active: user.Active ?? false,
            changePassword: false,
            updatedOn: user.UpdatedOn
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

    if (loggedInUser && loggedInUser.userID === userID && formData.active === false) {
      toast.error("You cannot set yourself as inactive");
      handleClose();
      return;
    }



    const newUser: UserType = {
      userID: userID,
      firstName: formData.firstName,
      lastName: formData.lastName!,
      emailID: formData.emailID,
      active: formData.active!,
      updatePassword: formData.changePassword,
      updatedOn: user.UpdatedOn,
      password: formData.password && formData.password.length ? formData.password : null
    }



    updateUserApiCall(newUser, dispatch, () => {
      getAllUsersApiCall(dispatch);
      handleClose();
      resetForm({ firstName: '', lastName: '', emailID: '', password: '', confirmPassword: '' })



      if (loggedInUser?.userID == userID) {
        dispatch(updateProfile({
          firstName: formData.firstName,
          lastName: formData.lastName,
          emailID: formData.emailID,
        }))
      }
    })
  }

  const handleClickShowPassword = () => setIsPasswordShown(show => !show);
  const handleClickShowConfirmPassword = () => setIsConfirmPasswordShown(show => !show);


  const handleClose = () => {
    resetForm({ firstName: '', lastName: '', emailID: '', password: '', confirmPassword: '', changePassword: false, active: false });
    setOpen(false)
  }

  const handleReset = () => {
    handleClose()
  }

  return (
    <Dialog fullWidth open={open} onClose={handleClose} maxWidth='sm' scroll='body' closeAfterTransition={false}>


      <DialogTitle className='flex items-center justify-between px-6 pb-2 pt-4'>
        <Typography variant='h5'>Edit User</Typography>
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
                rules={{ required: true }}
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
                rules={{ required: true }}
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

            {/* Email */}
            <Grid item xs={12}>
              <Controller
                name="emailID"
                control={control}
                rules={{ required: true }}
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



            {/* Change password checkbox */}
            <Grid item xs={12}>
              <Controller
                name="changePassword"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={<Checkbox {...field} checked={field.value} />}
                    label="Do you want to change the password?"
                  />
                )}
              />
            </Grid>

            {/* Password & Confirm Password */}
            {changePassword && (
              <>
                <Grid item xs={12} sm={6} className='mt-4'>
                  <Controller
                    name="password"
                    control={control}
                    render={({ field }) => (
                      <TextField
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
                        helperText={errors.password?.message || ' '}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={6} className='mt-4'>
                  <Controller
                    name="confirmPassword"
                    control={control}
                    render={({ field }) => (
                      <TextField
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
                        helperText={errors.confirmPassword?.message || ' '}
                      />
                    )}
                  />
                </Grid>
              </>
            )}

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

export default EditUserInfo
