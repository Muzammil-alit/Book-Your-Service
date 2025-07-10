import { useState, useEffect } from 'react'
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
  InputAdornment,
  Divider
} from '@mui/material'
import { Icon } from '@iconify/react'
import { useAppSelector } from '@/redux/useAppSelector'
import { changePassApiCall } from '@/views/admin/user/action'
import { toast } from 'react-toastify'

interface ChangePasswordSideModalProps {
  open: boolean
  onClose: () => void
}

const schema = yup.object().shape({
  currentPassword: yup.string().required('Current password is required'),

  newPassword: yup
    .string()
    .test('min-length', 'Password must be at least 8 characters long', value => {
      if (!value) return true
      return value.length >= 8
    })
    .test('max-length', 'Password must be at most 50 characters long', value => {
      if (!value) return true
      return value.length <= 50
    })
    .test('uppercase', 'Password must contain at least one uppercase letter', value => {
      if (!value) return true
      return /[A-Z]/.test(value)
    })
    .test('lowercase', 'Password must contain at least one lowercase letter', value => {
      if (!value) return true
      return /[a-z]/.test(value)
    })
    .test('number', 'Password must contain at least one number', value => {
      if (!value) return true
      return /\d/.test(value)
    })
    .test('special-char', 'Password must contain at least one special character', value => {
      if (!value) return true
      return /[!@#$%^&*()\-_=+{};:,<.>]/.test(value)
    }),

  confirmPassword: yup
    .string()
    .required('Please confirm your password')
    .oneOf([yup.ref('newPassword')], 'Passwords must match')
})

const defaultValues = {
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
}

const ChangePasswordSideModal = ({ open, onClose }: ChangePasswordSideModalProps) => {
  const dispatch = useDispatch()
  const user = useAppSelector((state) => state.authReducer.admin.user)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Reset password visibility when modal opens
  useEffect(() => {
    if (open) {
      setShowCurrentPassword(false)
      setShowNewPassword(false)
      setShowConfirmPassword(false)
    }
  }, [open])

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues
  })

  const handleClose = () => {
    reset(defaultValues) // Reset form with default values when modal is closed
    onClose()
  }

  const onSubmit = async (data: any) => {
    try {
      const userData = {
        emailID: user?.emailID,
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      }
      await changePassApiCall(userData, dispatch, () => {
        // toast.success('Password changed successfully')
        handleClose()
      })
    } catch (error) {
      console.error('Error changing password:', error)
      toast.error('Failed to change password. Please try again.')
    }
  }

  return (
    <Drawer
      open={open}
      anchor='right'
      variant='temporary'
      onClose={handleClose}
      ModalProps={{ keepMounted: true }}
      sx={{ '& .MuiDrawer-paper': { width: { xs: 300, sm: 400 } } }}
    >
      <Box className='flex items-center justify-between pli-5 plb-4'>
        <Typography variant='h5'>Change Password</Typography>
        <IconButton size='small' onClick={handleClose}>
          <Icon icon='ri:close-line' className='text-2xl' />
        </IconButton>
      </Box>
      <Divider />
      <Box className='p-5'>
        <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-5'>
          <Controller
            name='currentPassword'
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label='Current Password'
                type={showCurrentPassword ? 'text' : 'password'}
                error={!!errors.currentPassword}
                helperText={errors.currentPassword?.message}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position='end'>
                      <IconButton
                        edge='end'
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        onMouseDown={(e) => e.preventDefault()}
                      >
                        <Icon icon={showCurrentPassword ? 'ri:eye-off-line' : 'ri:eye-line'} />
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
            )}
          />
          <Controller
            name='newPassword'
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label='New Password'
                type={showNewPassword ? 'text' : 'password'}
                error={!!errors.newPassword}
                helperText={errors.newPassword?.message}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position='end'>
                      <IconButton
                        edge='end'
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        onMouseDown={(e) => e.preventDefault()}
                      >
                        <Icon icon={showNewPassword ? 'ri:eye-off-line' : 'ri:eye-line'} />
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
            rules={{ required: true }}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label='Confirm New Password'
                type={showConfirmPassword ? 'text' : 'password'}
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword?.message}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position='end'>
                      <IconButton
                        edge='end'
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        onMouseDown={(e) => e.preventDefault()}
                      >
                        <Icon icon={showConfirmPassword ? 'ri:eye-off-line' : 'ri:eye-line'} />
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
            )}
          />
          <Button
            type='submit'
            variant='contained'
            color='primary'
            className='mt-4'
          >
            Change Password
          </Button>
        </form>
      </Box>
    </Drawer>
  )
}

export default ChangePasswordSideModal 