// React Imports
import React, { useEffect, useState } from 'react'

// MUI Imports
import Button from '@mui/material/Button'
import Drawer from '@mui/material/Drawer'
import IconButton from '@mui/material/IconButton'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import InputAdornment from '@mui/material/InputAdornment'
import { Checkbox, FormControlLabel } from '@mui/material'

// Third-party Imports
import { useForm, Controller } from 'react-hook-form'
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import { useDispatch } from 'react-redux'
import { SketchPicker } from 'react-color'
import { AnimatePresence, motion } from 'framer-motion'
import { toast } from 'react-toastify'

// Local Imports
import ProfilePicUploader from './ProfilePicUploader'
import { createCarerApiCall, getAllCarersApiCall } from './action'
import { CarerType } from '@/types/apps/carerTypes'

type Props = {
  open: boolean
  handleClose: () => void
  carerData?: CarerType[]
  setData: (data: CarerType[]) => void
}

type FormValidateType = {
  descr: string
  color: string
  active: boolean
  profilePic?: File | null
  firstName: string
  lastName: string
  carerName: string;
  emailID: string
  password: string
  confirmPassword: string
}

const schema = yup.object().shape({
  descr: yup.string().required('Description is required'),
  color: yup.string().required('Color is required'),
  active: yup.boolean().required(),
  firstName: yup.string().required('First name is required'),
  lastName: yup.string().required('Last name is required'),
  emailID: yup.string().email('Please enter a valid email address').required('Email is required'),
  password: yup
    .string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters long')
    .max(50, 'Password cannot be longer than 50 characters')
    .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
    .matches(/\d/, 'Password must contain at least one number')
    .matches(/[!@#$%^&*()\-_=+{};:,<.>]/, 'Password must contain at least one special character'),
  confirmPassword: yup
    .string()
    .required('Confirm Password is required')
    .oneOf([yup.ref('password')], 'Passwords must match')
})

const AddCarerDrawer = (props: Props) => {
  const { open, handleClose, carerData, setData } = props
  const dispatch = useDispatch()

  const [profilePic, setProfilePic] = useState<File | null>(null)
  const [hovering, setHovering] = useState(false)
  const [isPasswordShown, setIsPasswordShown] = useState(false)
  const [isConfirmPasswordShown, setIsConfirmPasswordShown] = useState(false)

  type FormValidate = yup.InferType<typeof schema>


  const {
    control,
    reset,
    handleSubmit,
    formState: { errors }
  } = useForm<FormValidate>({
    resolver: yupResolver(schema),
    defaultValues: {
      descr: '',
      color: '',
      active: true,
      firstName: '',
      lastName: '',
      emailID: '',
      password: '',
      confirmPassword: ''
    }
  })



  const handleClickShowPassword = () => setIsPasswordShown(!isPasswordShown)
  const handleClickShowConfirmPassword = () => setIsConfirmPasswordShown(!isConfirmPasswordShown)

  const onSubmit = (data: FormValidateType) => {

    const newCarer: any = {
      carerName: data.carerName,
      descr: data.descr,
      color: data.color,
      active: data.active,
      firstName: data.firstName,
      lastName: data.lastName,
      emailID: data.emailID,
      password: data.password
    }

    if (profilePic) {
      newCarer.profilePic = profilePic
    }



    createCarerApiCall(newCarer, dispatch, (response) => {
      if (response && carerData) {
        getAllCarersApiCall(dispatch);
      }
      toast.success('Carer created successfully')
      handleReset()
    })
  }

  const handleReset = () => {
    handleClose()
    reset()
    setProfilePic(null)
    setIsPasswordShown(false)
    setIsConfirmPasswordShown(false)
  }

  return (
    <Drawer
      open={open}
      anchor='right'
      variant='temporary'
      onClose={handleReset}
      ModalProps={{ keepMounted: true }}
      sx={{ '& .MuiDrawer-paper': { width: { xs: 300, sm: 400 } } }}
    >
      <div className='flex items-center justify-between pli-5 plb-4'>
        <Typography variant='h5'>Add New Carer</Typography>
        <IconButton size='small' onClick={handleReset}>
          <i className='ri-close-line text-2xl' />
        </IconButton>
      </div>
      <Divider />
      <div className='p-5'>
        <form
          className='flex flex-col gap-5'
          onSubmit={(e) => {

            e.preventDefault();
            handleSubmit(onSubmit)(e)
          }}>
          <ProfilePicUploader profilePic={profilePic} setProfilePic={setProfilePic} isAddPopUp={true} />

          <Controller
            name='firstName'
            control={control}
            render={({ field }) => (
              <TextField {...field} fullWidth label='First Name' error={!!errors.firstName} helperText={errors.firstName?.message} />
            )}
          />

          <Controller
            name='lastName'
            control={control}
            render={({ field }) => (
              <TextField {...field} fullWidth label='Last Name' error={!!errors.lastName} helperText={errors.lastName?.message} />
            )}
          />

          <Controller
            name='emailID'
            control={control}
            render={({ field }) => (
              <TextField {...field} type='email' fullWidth label='Email ID' error={!!errors.emailID} helperText={errors.emailID?.message} />
            )}
          />

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
                      <IconButton edge='end' onClick={handleClickShowPassword} onMouseDown={e => e.preventDefault()}>
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
                      <IconButton edge='end' onClick={handleClickShowConfirmPassword} onMouseDown={e => e.preventDefault()}>
                        <i className={isConfirmPasswordShown ? 'ri-eye-off-line' : 'ri-eye-line'} />
                      </IconButton>
                    </InputAdornment>
                  )
                }}
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

          <div className="mb-4 relative">
            <Typography variant='body2'>Choose Color</Typography>
            <Controller
              name="color"
              control={control}
              render={({ field }) => (
                <div className="relative inline-block mt-2" onMouseEnter={() => setHovering(true)} onMouseLeave={() => setHovering(false)}>
                  <div className="w-10 h-10 border rounded cursor-pointer" style={{ backgroundColor: field.value }}></div>
                  <AnimatePresence>
                    {hovering && (
                      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.3 }} className="absolute z-10 bottom-full mt-1">
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
              <FormControlLabel control={<Checkbox {...field} checked={field.value} />} label='Active' />
            )}
          />

          <div className='flex items-center justify-between'>
            <Button variant='contained' type='submit'>
              Save
            </Button>
            <Button variant='outlined' color='error' onClick={handleReset}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </Drawer>
  )
}

export default AddCarerDrawer
