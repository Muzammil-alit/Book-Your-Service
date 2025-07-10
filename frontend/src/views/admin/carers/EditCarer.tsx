'use client'

// React Imports
import React, { useEffect, useState } from 'react';

// MUI Imports
import Grid from '@mui/material/Grid2'
import Dialog from '@mui/material/Dialog'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment';
import { Controller, useForm } from 'react-hook-form'
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useDispatch } from 'react-redux'
import { CarerType } from '@/types/apps/carerTypes'
import { getAllCarersApiCall, updateCarerApiCall } from './action'
import { Checkbox, FormControlLabel, CircularProgress, Typography } from '@mui/material'
import ProfilePicUploader from './ProfilePicUploader';
import { SketchPicker } from 'react-color';

import { AnimatePresence, motion } from "framer-motion";
import Divider from '@mui/material/Divider'

import { useSelector } from 'react-redux'
import { RootState } from '@/redux/store'


type EditCarerInfoProps = {
  open: boolean
  setOpen: (open: boolean) => void
  data: CarerType | null,
  carerData: CarerType[],
  setData: (data: CarerType[]) => void
}

type FormValidateType = {
  carerName: string,
  descr: string,
  color: string,
  active: boolean,
  firstName: string,
  lastName: string,
  emailID: string,
  password: string,
  confirmPassword: string,
  profilePic?: File | null,
}





const EditCarer = ({ open, setOpen, data, carerData, setData }: EditCarerInfoProps) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [profilePic, setProfilePic] = useState<File | null>(null);
  const [profilePicUrl, setProfilePicUrl] = useState<string | null>(null);
  const [isProfilePicRemoved, setIsProfilePicRemoved] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [isPasswordShown, setIsPasswordShown] = useState(false);
  const [isConfirmPasswordShown, setIsConfirmPasswordShown] = useState(false);

  const schema = yup.object().shape({
    descr: yup.string().required('Description is required'),
    color: yup.string().required('Color is required'),
    active: yup.boolean().required(),
    firstName: yup.string().required('First Name is required'),
    lastName: yup.string().required('Last Name is required'),
    emailID: yup.string().email('Invalid email').required('Email is required'),
    updatePassword: yup.boolean(),
    password: yup
      .string()
      .when('updatePassword', {
        is: true,
        then: schema =>
          schema
            .required('Password is required')
            .min(8, 'Password must be at least 8 characters long')
            .max(50, 'Password must be at most 50 characters long')
            .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
            .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
            .matches(/\d/, 'Password must contain at least one number')
            .matches(/[!@#$%^&*()\-_=+{};:,<.>]/, 'Password must contain at least one special character'),
        otherwise: schema => schema.notRequired(),
      }),
    confirmPassword: yup
      .string()
      .when('updatePassword', {
        is: true,
        then: schema =>
          schema
            .required('Confirm Password is required')
            .oneOf([yup.ref('password')], 'Passwords must match'),
        otherwise: schema => schema.notRequired(),
      }),
  });

  type FormValidate = yup.InferType<typeof schema>;

  const {
    control,
    reset: resetForm,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormValidate>({
    resolver: yupResolver(schema),
    defaultValues: {
      firstName: '',
      lastName: '',
      descr: '',
      color: '#1976d2',
      active: true,
      emailID: '',
      password: '',
      confirmPassword: '',
      updatePassword: false,
    },
  });

  const updatePassword = watch('updatePassword');

  useEffect(() => {
    if (data) {
      resetForm({
        firstName: data.FirstName || '',
        lastName: data.LastName || '',
        descr: data.Descr || '',
        color: data.Color || '#1976d2',
        active: data.Active ?? true,
        emailID: data.EmailID || '',
        password: '',
        confirmPassword: '',
        updatePassword: false,
      });

      if (typeof data?.ProfilePic === 'object') {
        const buffer = data?.ProfilePic;
        let imageSrc = '';

        if (buffer && buffer.data) {
          const base64String = btoa(
            new Uint8Array(buffer.data).reduce((data, byte) => data + String.fromCharCode(byte), '')
          );
          imageSrc = `data:image/jpeg;base64,${base64String}`;
        }
        setProfilePicUrl(imageSrc);
      } else {
        setProfilePicUrl(null);
      }
      setIsProfilePicRemoved(false);
    }
  }, [data, resetForm]);

  const loggedInUserID = useSelector((state: RootState) => state.authReducer?.admin?.user?.userID);

  const onSubmit = (formData: FormValidate) => {

    try {


      setLoading(true);

      const newCarer: any = {
        carerID: data?.CarerID,
        firstName: formData.firstName,
        lastName: formData.lastName,
        descr: formData.descr,
        color: formData.color,
        active: formData.active,
        emailID: formData.emailID,
      };

      if (formData.updatePassword) {
        newCarer.password = formData.password;
      }

      if (profilePic) {
        newCarer.profilePic = profilePic;
      } else if (isProfilePicRemoved) {
        newCarer.profilePic = null;
      } else if (profilePicUrl) {
        newCarer.profilePic = profilePicUrl;
      }

      const isProfileChanged = !!profilePic || isProfilePicRemoved;

      updateCarerApiCall(
        newCarer,
        isProfileChanged,
        dispatch,
        formData.updatePassword,
        data?.UpdatedOn,
        loggedInUserID,
        profilePicUrl,
        (updatedCarerData) => {
          handleClose();
          getAllCarersApiCall(dispatch);
          setLoading(false);
        }
      );
    }
    catch (err) {

    }
    finally {
      setLoading(false)
    }
  };

  const handleClose = () => {
    setOpen(false);
    resetForm();
    setProfilePic(null);
    setProfilePicUrl(null);
  };

  const handleClickShowPassword = () => setIsPasswordShown(!isPasswordShown);
  const handleClickShowConfirmPassword = () => setIsConfirmPasswordShown(!isConfirmPasswordShown);

  return (
    <Dialog
      fullWidth
      open={open}
      maxWidth='sm'
      scroll='body'
      closeAfterTransition={false}
    >
      <DialogTitle className='flex items-center justify-between px-6 pb-2 pt-4'>
        <Typography variant='h5'>Edit Carer</Typography>
        <IconButton size='small' onClick={handleClose}>
          <i className='ri-close-line text-2xl' />
        </IconButton>
      </DialogTitle>
      <Divider />

      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent className='overflow-visible'>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <CircularProgress />
            </div>
          ) : (
            <div className='grid gap-5'>
              {open && (
                <ProfilePicUploader
                  profilePic={profilePic}
                  setProfilePic={setProfilePic}
                  initialImageUrl={profilePicUrl}
                  onRemove={() => {
                    setIsProfilePicRemoved(true);
                    setProfilePic(null);
                    setProfilePicUrl(null);
                  }}
                />
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Controller
                  name='firstName'
                  control={control}
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
              </div>

              <Controller
                name='emailID'
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label='Email ID'
                    type='email'
                    error={!!errors.emailID}
                    helperText={errors.emailID?.message}
                  />
                )}
              />

              <Controller
                name='descr'
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    rows={4}
                    fullWidth
                    multiline
                    label='Description'
                    error={!!errors.descr}
                    helperText={errors.descr?.message}
                  />
                )}
              />

              <div className='flex justify-between align-start'>
                <div className="relative w-[100px]">
                  <Typography variant='body2'>Choose Color</Typography>
                  <Controller
                    name="color"
                    control={control}
                    render={({ field }) => (
                      <div onMouseEnter={() => setHovering(true)} onMouseLeave={() => setHovering(false)}>
                        <div className="w-10 h-10 border rounded cursor-pointer mt-2" style={{ backgroundColor: field.value }}></div>
                        <AnimatePresence>
                          {hovering && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.95 }}
                              transition={{ duration: 0.3 }}
                              className="absolute z-10 bottom-10"
                            >
                              <SketchPicker color={field.value} onChange={(color) => field.onChange(color.hex)} />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )}
                  />
                  {errors.color && <p className="text-red-500 text-sm">{errors.color.message}</p>}
                </div>

                <Controller
                  name='active'
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={<Checkbox {...field} checked={field.value} />}
                      label='Active'
                    />
                  )}
                />
              </div>

              <Controller
                name="updatePassword"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={<Checkbox {...field} checked={field.value} />}
                    label="Do you want to update password?"
                  />
                )}
              />

              {updatePassword && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Controller
                    name='password'
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label='Password'
                        type={isPasswordShown ? 'text' : 'password'}
                        error={!!errors.password}
                        helperText={errors.password?.message}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position='end'>
                              <IconButton onClick={handleClickShowPassword} onMouseDown={e => e.preventDefault()}>
                                <i className={isPasswordShown ? 'ri-eye-off-line' : 'ri-eye-line'} />
                              </IconButton>
                            </InputAdornment>
                          )
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
                        error={!!errors.confirmPassword}
                        helperText={errors.confirmPassword?.message}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position='end'>
                              <IconButton onClick={handleClickShowConfirmPassword} onMouseDown={e => e.preventDefault()}>
                                <i className={isConfirmPasswordShown ? 'ri-eye-off-line' : 'ri-eye-line'} />
                              </IconButton>
                            </InputAdornment>
                          )
                        }}
                      />
                    )}
                  />
                </div>
              )}
            </div>
          )}
        </DialogContent>
        <DialogActions className='flex items-center justify-between mt-2'>
          <Button
            type='submit'
            variant="contained"
            color="primary"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            Save
          </Button>
          <Button
            variant='outlined'
            color='error'
            onClick={handleClose}
            disabled={loading}
          >
            Cancel
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};



export default EditCarer
