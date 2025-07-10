// React Imports
import { useEffect, useState } from 'react'
import React from 'react'

// MUI Imports
import Button from '@mui/material/Button'
import Drawer from '@mui/material/Drawer'
import IconButton from '@mui/material/IconButton'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Paper from '@mui/material/Paper'
import Box from '@mui/material/Box'
import Switch from '@mui/material/Switch'
import Stack from '@mui/material/Stack'
import { Checkbox, FormControlLabel } from '@mui/material'
import { toast } from 'react-toastify'

import { LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import dayjs, { Dayjs } from 'dayjs'

import './index.css'

// Third-party Imports
import { useForm, Controller } from 'react-hook-form'

// Types Imports
import { useDispatch } from 'react-redux'
import { createServiceApiCall, getAllServicesApiCall } from './action'
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import { ServiceType, ServiceDurationType } from '@/types/apps/servicesTypes'
import { TimePicker } from '@mui/x-date-pickers'

type Props = {
  open: boolean
  handleClose: () => void
  serviceData?: ServiceType[]
  setData: (data: ServiceType[]) => void
}

type ShiftType = {
  duration: string
  startTime: Dayjs
  endTime: Dayjs
  isEditable?: boolean
  durationError?: string
}

type FormValidateType = {
  serviceName: string
  descr: string
  serviceDurationType: boolean
  active: boolean
}

const schema = yup.object().shape({
  serviceName: yup
    .string()
    .required('Service name is required')
    .max(100, 'Service name must be at most 100 characters'),
  descr: yup.string().required('Description is required'),
  serviceDurationType: yup.boolean().required('Hours type is required'),
  active: yup.boolean().required(),
})

const defaultShifts: ShiftType[] = [
  {
    duration: '',
    startTime: dayjs('2022-04-17T05:00'),
    endTime: dayjs('2022-04-17T18:00'),
    isEditable: true,
  },
]

const AddServiceDrawer = (props: Props) => {
  // Props
  const { open, handleClose, serviceData, setData } = props
  const dispatch = useDispatch()

  // States
  const [shifts, setShifts] = useState<ShiftType[]>(defaultShifts)
  const [isVariableDuration, setIsVariableDuration] = useState<boolean>(false)
  const [newShift, setNewShift] = useState<ShiftType>({
    duration: '',
    startTime: dayjs('2022-04-17T05:00'),
    endTime: dayjs('2022-04-17T18:00'),
  })
  const [formErrors, setFormErrors] = useState<string[]>([])

  // Hooks
  const {
    control,
    reset: resetForm,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<FormValidateType>({
    resolver: yupResolver(schema),
    defaultValues: {
      serviceName: '',
      descr: '',
      serviceDurationType: false,
      active: true,
    },
  })

  // Keep isVariableDuration in sync with form value
  React.useEffect(() => {
    setIsVariableDuration(watch('serviceDurationType'))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watch('serviceDurationType')])

  const validateShifts = (): boolean => {
    const errors: string[] = []
    let isValid = true

    if (!isVariableDuration) {
      const updatedShifts = [...shifts]

      for (let i = 0; i < shifts.length; i++) {
        const shift = shifts[i]
        const start = dayjs(shift.startTime)
        const end = dayjs(shift.endTime)
        const durationHours = Number(shift.duration)

        updatedShifts[i] = { ...updatedShifts[i], durationError: undefined }

        // Validate duration
        if (!shift.duration || shift.duration === '') {
          updatedShifts[i].durationError = 'Duration cannot be empty'
          isValid = false
        } else if (isNaN(durationHours)) {
          updatedShifts[i].durationError = 'Duration must be a number'
          isValid = false
        } else if (durationHours <= 0) {
          updatedShifts[i].durationError = 'Duration must be positive'
          isValid = false
        } else if (durationHours > 99) {
          updatedShifts[i].durationError = 'Duration cannot be more than 99 hours'
          isValid = false
        } else if (start.isValid() && end.isValid()) {
          const timeDiffHours = end.diff(start, 'hour', true)
          if (durationHours > timeDiffHours) {
            updatedShifts[i].durationError =
              'Duration cannot be more than the difference between start and end time'
            isValid = false
          }
        }
      }

      setShifts(updatedShifts)
    }

    setFormErrors(errors)
    return isValid
  }


  const onSubmit = (data: FormValidateType) => {
    const isValid = validateShifts()
    if (!isValid) {
      return
    }

    const newService: ServiceType = {
      serviceID: null,
      serviceName: data.serviceName,
      descr: data.descr,
      serviceDurationType: data.serviceDurationType,
      active: data.active,
      updatedOn: new Date(),
    }

    const serviceDurations: ServiceDurationType[] = !data.serviceDurationType
      ? shifts.map((shift) => ({
          duration: Number(shift.duration),
          startTime: dayjs(shift.startTime).format('HH:mm:ss'),
          endTime: dayjs(shift.endTime).format('HH:mm:ss'),
        }))
      : []

    // Call the API to create the service
    createServiceApiCall(newService, serviceDurations, dispatch, (_data: any) => {
      handleClose()
      resetForm({
        serviceName: '',
        descr: '',
        serviceDurationType: false,
        active: true,
      })
      setShifts(defaultShifts)
      getAllServicesApiCall(dispatch)
    })
  }

  const handleReset = () => {
    resetForm({
      serviceName: '',
      descr: '',
      serviceDurationType: false,
      active: true,
    })
    setIsVariableDuration(false)
    setShifts(defaultShifts)
    setFormErrors([])
    handleClose()
  }

  const handleRemoveShift = (index: number) => {
    if (shifts.length === 1) {
      toast.error('At least one shift is required.')
      return
    }
    const newShifts = [...shifts]
    newShifts.splice(index, 1)
    setShifts(newShifts)
  }

  const handleHoursTypeChange = (isVariable: boolean) => {
    setIsVariableDuration(isVariable)
  }

  const handleShiftChange = (
    index: number,
    field: keyof ShiftType,
    value: string | number | Dayjs
  ) => {
    const updatedShifts = [...shifts]

    if (field === 'duration') {
      const numValue = Number(value)
      if (isNaN(numValue) || numValue < 0) {
        return
      }

      updatedShifts[index] = {
        ...updatedShifts[index],
        [field]: value as string,
        durationError: undefined,
      }
    } else if (field === 'startTime' || field === 'endTime') {
      updatedShifts[index] = { ...updatedShifts[index], [field]: value as Dayjs }
    } else {
      updatedShifts[index] = { ...updatedShifts[index], [field]: value }
    }

    // Validate duration against time difference when all fields are present
    const currentShift = updatedShifts[index]
    if (currentShift.startTime && currentShift.endTime && currentShift.duration) {
      const start = dayjs(currentShift.startTime)
      const end = dayjs(currentShift.endTime)
      const durationHours = Number(currentShift.duration)

      if (start.isValid() && end.isValid() && !isNaN(durationHours)) {
        const timeDiffHours = end.diff(start, 'hour', true)
        if (durationHours > timeDiffHours) {
          updatedShifts[index].durationError =
            'Duration cannot be more than the difference between start and end time'
        }
      }
    }

    setShifts(updatedShifts)
  }

  const addNewShift = () => {
    setShifts([
      ...shifts,
      {
        ...newShift,
        isEditable: true,
      },
    ])
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const allowedKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab']

    if (!/^\d$/.test(e.key) && !allowedKeys.includes(e.key)) {
      e.preventDefault()
    }
  }

  return (
    <Drawer
      open={open}
      anchor="right"
      variant="temporary"
      onClose={handleReset}
      ModalProps={{ keepMounted: true }}
      sx={{ '& .MuiDrawer-paper': { width: { xs: 300, sm: 600 } } }}
    >
      <div className="flex items-center justify-between pli-5 plb-4">
        <Typography variant="h5">Add New Service</Typography>
        <IconButton size="small" onClick={handleReset}>
          <i className="ri-close-line text-2xl" />
        </IconButton>
      </div>
      <Divider />
      <div className="p-5">
        <form onSubmit={handleSubmit((data) => onSubmit(data))} className="flex flex-col gap-5">
          <Controller
            name="serviceName"
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="Service Name"
                {...(errors.serviceName && { error: true, helperText: errors.serviceName.message })}
              />
            )}
          />
          <Controller
            name="descr"
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <TextField
                {...field}
                rows={4}
                fullWidth
                multiline
                label="Description"
                {...(errors.descr && { error: true, helperText: errors.descr.message })}
              />
            )}
          />

          <Controller
            name="serviceDurationType"
            control={control}
            render={({ field }) => (
              <Box sx={{ mt: 1 }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography>{field.value ? 'Variable hours' : 'Fixed hours'}</Typography>
                  <Switch
                    checked={field.value}
                    onChange={(e) => {
                      const newValue = e.target.checked
                      field.onChange(newValue)
                      handleHoursTypeChange(newValue)
                    }}
                    sx={{
                      '& .MuiSwitch-thumb': {
                        bgcolor: 'white',
                      },
                      '& .MuiSwitch-track': {
                        bgcolor: (theme) =>
                          field.value ? theme.palette.primary.main : theme.palette.primary.light,
                        opacity: '1 !important',
                      },
                    }}
                  />
                </Stack>
              </Box>
            )}
          />

          {isVariableDuration === false && (
            <Box>
              <TableContainer component={Paper}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ backgroundColor: 'action.hover', paddingBottom: '10px' }}>
                      <TableCell>Durations</TableCell>
                      <TableCell>Earliest Shift Start Time</TableCell>
                      <TableCell>Latest Shift End Time</TableCell>
                      <TableCell align="left">
                        <IconButton size="small" color="primary" onClick={addNewShift}>
                          <i className="ri-add-line" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {shifts.map((shift, index) => (
                      <React.Fragment key={index}>
                        <TableRow sx={{ position: 'relative' }}>
                          <TableCell>
                            <div className="flex flex-col">
                              <TextField
                                type="text"
                                value={shift.duration}
                                onChange={(e) => {
                                  const value = e.target.value
                                  if (/^\d{0,2}$/.test(value)) {
                                    handleShiftChange(index, 'duration', value)
                                  }
                                }}
                                InputProps={{
                                  sx: {
                                    width: '72px',
                                    height: '36px',
                                    fontSize: '12px',
                                    ...(shift.durationError && {
                                      borderColor: 'red',
                                      outline: '1px solid red',
                                    }),
                                  },
                                }}
                                error={!!shift.durationError}
                                onKeyDown={handleKeyDown}
                                placeholder="Hours"
                              />
                            </div>
                          </TableCell>

                          <TableCell>
                            <div className="flex flex-col">
                              <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <TimePicker
                                  value={shift.startTime}
                                  onChange={(value) => {
                                    if (value) {
                                      handleShiftChange(index, 'startTime', value)
                                    }
                                  }}
                                  ampm
                                  timeSteps={{ minutes: 15 }}
                                  slotProps={{
                                    textField: {
                                      size: 'small',
                                      sx: {
                                        width: '140px',
                                        '& input': {
                                          fontSize: '12px',
                                          padding: '4px 6px',
                                        },
                                        '& label': {
                                          fontSize: '12px',
                                        },
                                        '& .MuiInputBase-root': {
                                          fontSize: '12px',
                                        },
                                      },
                                    },
                                    popper: {
                                      sx: {
                                        width: 'auto !important',
                                        '& .MuiPickersLayout-root': {
                                          minWidth: 'auto !important',
                                        },
                                        '& .MuiPickersLayout-contentWrapper': {
                                          scrollbarWidth: 'none',
                                          '&::-webkit-scrollbar': {
                                            display: 'none',
                                          },
                                          msOverflowStyle: 'none',
                                          overflow: 'auto',
                                        },
                                        '& .MuiMultiSectionDigitalClockSection-root': {
                                          scrollbarWidth: 'none',
                                          '&::-webkit-scrollbar': {
                                            display: 'none',
                                          },
                                          msOverflowStyle: 'none',
                                          overflow: 'auto',
                                        },
                                        '& .MuiTimeClockTabs-root': {
                                          scrollbarWidth: 'none',
                                          '&::-webkit-scrollbar': {
                                            display: 'none',
                                          },
                                          msOverflowStyle: 'none',
                                          overflow: 'auto',
                                        },
                                      },
                                    },
                                  }}
                                />
                              </LocalizationProvider>
                            </div>
                          </TableCell>

                          <TableCell>
                            <div className="flex flex-col">
                              <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <TimePicker
                                  value={shift.endTime}
                                  onChange={(value) => {
                                    if (value) {
                                      handleShiftChange(index, 'endTime', value)
                                    }
                                  }}
                                  ampm
                                  timeSteps={{ minutes: 15 }}
                                  slotProps={{
                                    textField: {
                                      size: 'small',
                                      sx: {
                                        width: '140px',
                                        '& input': {
                                          fontSize: '12px',
                                          padding: '4px 6px',
                                        },
                                        '& label': {
                                          fontSize: '12px',
                                        },
                                        '& .MuiInputBase-root': {
                                          fontSize: '12px',
                                        },
                                      },
                                    },
                                    popper: {
                                      sx: {
                                        width: 'auto !important',
                                        '& .MuiPickersLayout-root': {
                                          minWidth: 'auto !important',
                                        },
                                        '& .MuiPickersLayout-contentWrapper': {
                                          scrollbarWidth: 'none',
                                          '&::-webkit-scrollbar': {
                                            display: 'none',
                                          },
                                          msOverflowStyle: 'none',
                                          overflow: 'auto',
                                        },
                                        '& .MuiMultiSectionDigitalClockSection-root': {
                                          scrollbarWidth: 'none',
                                          '&::-webkit-scrollbar': {
                                            display: 'none',
                                          },
                                          msOverflowStyle: 'none',
                                          overflow: 'auto',
                                        },
                                        '& .MuiTimeClockTabs-root': {
                                          scrollbarWidth: 'none',
                                          '&::-webkit-scrollbar': {
                                            display: 'none',
                                          },
                                          msOverflowStyle: 'none',
                                          overflow: 'auto',
                                        },
                                      },
                                    },
                                  }}
                                />
                              </LocalizationProvider>
                            </div>
                          </TableCell>

                          <TableCell>
                            <IconButton color="error" size="small" onClick={() => handleRemoveShift(index)}>
                              <i className="ri-delete-bin-7-line" />
                            </IconButton>
                          </TableCell>
                        </TableRow>

                        {shift.durationError && (
                          <TableRow>
                            <TableCell colSpan={4} sx={{ p: 1 }}>
                              <Typography
                                color="error"
                                variant="caption"
                                sx={{ fontSize: '12px', color: 'red', marginLeft: '12px' }}
                              >
                                {shift.durationError}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        )}
                      </React.Fragment>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          <Controller
            name="active"
            control={control}
            render={({ field }) => (
              <FormControlLabel control={<Checkbox {...field} checked={field.value} />} label="Active" />
            )}
          />

          <div className="flex items-center justify-between mt-4">
            <Button
              variant="contained"
              type="submit"
              disabled={formErrors.length > 0 || shifts.some((shift) => !!shift.durationError)}
            >
              Save
            </Button>
            <Button variant="outlined" color="error" onClick={() => handleReset()}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </Drawer>
  )
}

export default AddServiceDrawer