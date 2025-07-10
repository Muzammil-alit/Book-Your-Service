// React Imports
import { useState } from 'react'

// MUI Imports
import Button from '@mui/material/Button'
import Drawer from '@mui/material/Drawer'
import IconButton from '@mui/material/IconButton'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'

// Third-party Imports
import { useForm, Controller } from 'react-hook-form'
import { toast } from 'react-toastify'

// Types Imports
import type { UserType } from '@/types/apps/userTypes'
import { InputAdornment } from '@mui/material'
import { useDispatch } from 'react-redux'
import { createUserApiCall, getAllUsersApiCall } from './action'



import { valibotResolver } from '@hookform/resolvers/valibot'
import { object, minLength, maxLength, string, email, pipe, nonEmpty, custom } from 'valibot'


type Props = {
  open: boolean
  handleClose: () => void
  userData?: UserType[]
  setData: (data: UserType[]) => void
}

type FormValidateType = {
  firstName: string
  lastName?: string
  emailID: string
  password: string
  confirmPassword: string;
}

const schema = object({
  firstName: pipe(string(), minLength(1, 'First name is required')),
  lastName: pipe(string(), minLength(1, 'Last name is required')),
  emailID: pipe(string(), minLength(1, 'Email is required'), email('Please enter a valid email address')),
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


const AddUserDrawer = (props: Props) => {
  // Props
  const { open, handleClose, userData, setData } = props
  const dispatch = useDispatch();

  // States
  const [isPasswordShown, setIsPasswordShown] = useState(false);
  const [isConfirmPasswordShown, setIsConfirmPasswordShown] = useState(false);

  // Hooks
  const {
    control,
    reset: resetForm,
    handleSubmit,
    formState: { errors }
  } = useForm<FormValidateType>({
    resolver: valibotResolver(schema),
    defaultValues: {
      firstName: '',
      lastName: '',
      emailID: '',
      password: '',
      confirmPassword: '',
    }
  })

  const onSubmit = (data: FormValidateType) => {
    const newUser: UserType = {
      // userID: (userData?.length && userData?.length + 1) || 1,
      firstName: data.firstName,
      lastName: data.lastName!,
      emailID: data.emailID,
      active: true,
      password: data.password,
      userType: 1,
    }
    createUserApiCall(newUser, dispatch, (data) => {
      getAllUsersApiCall(dispatch);
      handleClose();
      resetForm({ firstName: '', lastName: '', emailID: '', password: '', confirmPassword: '' })
    });
  }

  const handleReset = () => {
    handleClose()
    resetForm()
  }

  const handleClickShowPassword = () => setIsPasswordShown(show => !show);
  const handleClickShowConfirmPassword = () => setIsConfirmPasswordShown(show => !show);

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
        <Typography variant='h5'>Add New User</Typography>
        <IconButton size='small' onClick={handleReset}>
          <i className='ri-close-line text-2xl' />
        </IconButton>
      </div>
      <Divider />
      <div className='p-5'>
        <form onSubmit={handleSubmit(data => onSubmit(data))} className='flex flex-col gap-5'>
          <Controller
            name='firstName'
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label='First Name'
                placeholder='John Doe'
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
                label='Email'
                placeholder='johndoe@gmail.com'
                error={Boolean(errors.emailID)}
                helperText={errors.emailID?.message}
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
                id='password'
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
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label='Confirm Password'
                id='confirmPassword'
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
                          aria-label='toggle password visibility'
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
          {/* <FormControl fullWidth>
            <InputLabel id='country' error={Boolean(errors.active)}>
              Select Status
            </InputLabel>
            <Controller
              name='active'
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <Select label='Select Status' {...field} error={Boolean(errors.active)}>
                  <MenuItem value={'true'}>Active</MenuItem>
                  <MenuItem value={'false'}>Inactive</MenuItem>
                </Select>
              )}
            />
            {errors.active && <FormHelperText error>This field is required.</FormHelperText>}
          </FormControl> */}
          <div className='flex items-center justify-between mt-4'>
            <Button variant='contained' type='submit'>
              Save
            </Button>
            <Button variant='outlined' color='error' onClick={() => handleReset()}>
              Cancel
            </Button>
          </div>


        </form>
      </div>
    </Drawer>
  )
}

export default AddUserDrawer
