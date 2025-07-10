'use client'

// React Imports
import React, { useState, useEffect } from 'react'

// MUI Imports
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
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
import { toast } from "react-toastify";
import { LocalizationProvider, TimePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';


import dayjs, { Dayjs } from 'dayjs';

import utc from 'dayjs/plugin/utc';

import axios from 'axios'


import { getAllServicesApiCall } from './action'

// Third-party Imports
import { useForm, Controller } from 'react-hook-form'

// Types Imports
import { useDispatch } from 'react-redux'
import { updateServiceApiCall } from './action'
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { ServiceType, ServiceDurationType } from '@/types/apps/servicesTypes'

type EditServiceInfoProps = {
  open: boolean
  setOpen: (open: boolean) => void
  data: ServiceType[],
  selectedService: ServiceType | null,
  setData: (data: ServiceType[]) => void
}

type ShiftType = {
  duration: string;
  startTime: string | Dayjs;
  endTime: string | Dayjs;
  isEditable?: boolean;
  durationError?: string;
  timeError?: string;
}

type FormValidateType = {
  serviceName: string,
  descr: string,
  serviceDurationType: boolean,
  active: boolean,
  updatedOn: string
}

const schema = yup.object().shape({
  serviceName: yup
    .string()
    .required('Service name is required')
    .max(100, 'Service name must be at most 100 characters'),
  descr: yup.string().required("Description is required"),
  serviceDurationType: yup.boolean().required("Hours type is required"),
  active: yup.boolean().required(),
});

const defaultShifts: ShiftType[] = [{
  duration: '',
  startTime: dayjs().set('hour', 0).set('minute', 0).set('second', 0),
  endTime: dayjs().set('hour', 0).set('minute', 0).set('second', 0),
  isEditable: true
}];



const EditService = ({ open, setOpen, data, selectedService, setData }: EditServiceInfoProps) => {
  const dispatch = useDispatch();
  dayjs.extend(utc);

  const [serviceData, setServiceData] = useState<any>(null);
  const [shifts, setShifts] = useState<ShiftType[]>(defaultShifts);
  const [isVariableDuration, setIsVariableDuration] = useState<boolean>(false);
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;


    type FormValidate = yup.InferType<typeof schema>


  const {
    control,
    reset: resetForm,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValidate>({
    resolver: yupResolver(schema),
    defaultValues: {
      serviceName: '',
      descr: '',
      serviceDurationType: false,
      active: false,
    },
  });

  // Fetch service data when component mounts or selectedService changes
  useEffect(() => {
    if (open) {
      const token = localStorage.getItem("adminToken");

      axios.get(`${API_BASE_URL}/admin/services/view/${selectedService?.ServiceID}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        }
      }).then((res) => {
        const apiData = res.data.data.service
        setServiceData(apiData);

        let durationType = false;
        if (typeof apiData.ServiceDurationType === 'boolean') {
          durationType = apiData.ServiceDurationType;
        } else {
          durationType = apiData.ServiceDurationType === 'variable';
        }

        setIsVariableDuration(durationType);

        resetForm({
          serviceName: apiData.ServiceName || '',
          descr: apiData.Descr || '',
          serviceDurationType: durationType,
          active: apiData.Active ?? false,
          updatedOn: apiData?.UpdatedOn
        });

        if (apiData.Durations && apiData.Durations.length > 0 && !durationType) {
          const baseDate = dayjs().format('YYYY-MM-DD');
          const formattedShifts = apiData.Durations.map(
            ({ ShiftStartTime, ShiftEndTime, Duration }: any) => ({
              startTime: dayjs(ShiftStartTime).utc(),
              endTime: dayjs(ShiftEndTime).utc(),
              duration: Duration.toString(),
              isEditable: true
            })
          );
          setShifts(formattedShifts);
        } else {
          setShifts(defaultShifts.length > 0 ? defaultShifts : [{
            duration: '',
            startTime: dayjs('2022-04-17T05:00'),
            endTime: dayjs('2022-04-17T18:00'),
            isEditable: true
          }]);
        }
      }).catch((err) => {
        console.error(err);
      });
    }
  }, [open]);

  // Add effect to handle changes to serviceDurationType
  useEffect(() => {
    if (isVariableDuration === true && shifts.length > 0) {
      setShifts([]);
    } else if (isVariableDuration === false && shifts.length === 0) {
      setShifts([{
        duration: '',
        startTime: dayjs('2022-04-17T05:00'),
        endTime: dayjs('2022-04-17T18:00'),
        isEditable: true
      }]);
    }
  }, [isVariableDuration]);

  const validateShifts = (): boolean => {
    const errors: string[] = [];
    let isValid = true;

    if (!isVariableDuration) {
      const updatedShifts = [...shifts];

      for (let i = 0; i < shifts.length; i++) {
        const shift = shifts[i];
        const start = dayjs(shift.startTime);
        const end = dayjs(shift.endTime);
        const durationHours = Number(shift.duration);

        updatedShifts[i] = { ...updatedShifts[i], durationError: undefined };

        // Validate duration
        if (!shift.duration || shift.duration === '') {
          updatedShifts[i].durationError = 'Duration cannot be empty';
          isValid = false;
        } else if (isNaN(durationHours)) {
          updatedShifts[i].durationError = 'Duration must be a number';
          isValid = false;
        } else if (durationHours <= 0) {
          updatedShifts[i].durationError = 'Duration must be positive';
          isValid = false;
        } else if (durationHours > 99) {
          updatedShifts[i].durationError = 'Duration cannot be more than 99 hours';
          isValid = false;
        } else if (start.isValid() && end.isValid()) {
          const timeDiffHours = end.diff(start, 'hour', true);
          if (durationHours > timeDiffHours) {
            updatedShifts[i].durationError = 'Duration cannot be more than the difference between start and end times';
            isValid = false;
          }
        }
      }

      setShifts(updatedShifts);
    }

    setFormErrors(errors);
    return isValid;
  }

  const onSubmit = (formData: FormValidateType) => {
    const isValid = validateShifts();
    if (!isValid) {
      return;
    }

    const updatedService: any = {
      serviceID: selectedService?.serviceID,
      serviceName: formData.serviceName,
      descr: formData.descr,
      serviceDurationType: isVariableDuration,
      active: formData.active,
      updatedOn: serviceData.UpdatedOn
    }

    const serviceDurations: any[] =
      isVariableDuration === false ?
        shifts.map(shift => ({
          duration: shift.duration,
          startTime: dayjs.isDayjs(shift.startTime)
            ? shift.startTime.format('HH:mm:ss')
            : dayjs(shift.startTime).format('HH:mm:ss'),
          endTime: dayjs.isDayjs(shift.endTime)
            ? shift.endTime.format('HH:mm:ss')
            : dayjs(shift.endTime).format('HH:mm:ss')
        })) : [];

    updateServiceApiCall(updatedService, serviceDurations, selectedService?.ServiceID, dispatch, () => {
      if (setData) {
        const updatedServiceData = data.map(service => {
          if (service.serviceID === updatedService.serviceID) {
            return { ...service, ...updatedService };
          } else {
            return service;
          }
        });

        setData(updatedServiceData);
      }
      handleClose();
      getAllServicesApiCall(dispatch);
    });
  }

  const handleClose = () => {
    setOpen(false);
  }

  const handleReset = () => {
    resetForm();
    setShifts(defaultShifts);
    setFormErrors([]);
    handleClose();
  }

  const handleRemoveShift = (index: number) => {
    if (shifts.length === 1) {
      toast.error("At least one shift is required.");
      return;
    }
    const newShifts = [...shifts];
    newShifts.splice(index, 1);
    setShifts(newShifts);
  };

  const handleHoursTypeChange = (type: boolean) => {
    setIsVariableDuration(type);
  }

  const handleShiftChange = (index: number, field: keyof ShiftType, value: string | number | Dayjs) => {
    const updatedShifts = [...shifts];

    if (field === 'duration') {
      let numValue: number;
      if (typeof value === 'string' && value.trim() === '') {
        numValue = 0;
      } else {
        numValue = Number(value);
        if (isNaN(numValue) || numValue < 0) return;
      }

      updatedShifts[index] = {
        ...updatedShifts[index],
        [field]: value.toString(),
        durationError: undefined
      };
    } else if (field === 'startTime' || field === 'endTime') {
      if (dayjs.isDayjs(value) && value.isValid()) {
        updatedShifts[index] = {
          ...updatedShifts[index],
          [field]: value
        };
      } else if (typeof value === 'string' && value) {
        const parsedDate = dayjs(value);
        if (parsedDate.isValid()) {
          updatedShifts[index] = {
            ...updatedShifts[index],
            [field]: parsedDate
          };
        }
      }
    } else {
      updatedShifts[index] = { ...updatedShifts[index], [field]: value };
    }

    // Validate duration against time difference when all fields are present
    const currentShift = updatedShifts[index];
    if (currentShift.startTime && currentShift.endTime && currentShift.duration) {
      const start = dayjs(currentShift.startTime);
      const end = dayjs(currentShift.endTime);
      const durationHours = Number(currentShift.duration);

      if (start.isValid() && end.isValid() && !isNaN(durationHours)) {
        const timeDiffHours = end.diff(start, 'hour', true);
        if (durationHours > timeDiffHours) {
          updatedShifts[index].durationError = 'Duration cannot be more than the difference between start and end times';
        } else {
          updatedShifts[index].durationError = undefined;
        }
      }
    }

    setShifts(updatedShifts);
  };

  const addNewShift = () => {
    const baseDate = dayjs().format('YYYY-MM-DD');
    const defaultStartTime = dayjs(`${baseDate}T05:00:00`);
    const defaultEndTime = dayjs(`${baseDate}T18:00:00`);

    setShifts([
      ...shifts,
      {
        duration: '',
        startTime: defaultStartTime,
        endTime: defaultEndTime,
        isEditable: true
      }
    ]);
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const allowedKeys = [
      'Backspace',
      'Delete',
      'ArrowLeft',
      'ArrowRight',
      'Tab',
    ];

    if (
      !/^\d$/.test(e.key) && // If it's not a digit (0-9)
      !allowedKeys.includes(e.key)
    ) {
      e.preventDefault();
    }
  }

  return (
    <Dialog
      fullWidth
      open={open}
      onClose={handleClose}
      maxWidth='md'
      scroll='paper'
      closeAfterTransition={false}
    >
      <DialogTitle className='flex items-center justify-between px-6 pb-2 pt-4'>
        <Typography variant='h5'>Edit Service</Typography>
        <IconButton size='small' onClick={handleReset}>
          <i className='ri-close-line text-2xl' />
        </IconButton>
      </DialogTitle>
      <Divider />
      <DialogContent className='p-6'>
        <form onSubmit={handleSubmit(data => onSubmit(data as any))} className='flex flex-col gap-5'>
          <Controller
            name='serviceName'
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label='Service Name'
                placeholder='Service Name'
                {...(errors.serviceName && { error: true, helperText: errors.serviceName.message })}
              />
            )}
          />
          <Controller
            name='descr'
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <TextField
                {...field}
                rows={4}
                fullWidth
                multiline
                label='Description'
                {...(errors.descr && { error: true, helperText: errors.descr.message })}
              />
            )}
          />

          <Controller
            name='serviceDurationType'
            control={control}
            render={({ field }) => (
              <Box sx={{ mt: 1 }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography>{isVariableDuration === false ? 'Fixed hours' : 'Variable hours'}</Typography>
                  <Switch
                    checked={isVariableDuration}
                    onChange={(e) => {
                      const newValue = e.target.checked;
                      field.onChange(newValue);
                      handleHoursTypeChange(newValue);
                    }}
                    sx={{
                      '& .MuiSwitch-thumb': {
                        bgcolor: 'white',
                      },
                      '& .MuiSwitch-track': {
                        opacity: '1 !important'
                      }
                    }}
                  />
                </Stack>
              </Box>
            )}
          />

          {isVariableDuration === false && (
            <Box style={{ overflow: 'none !important' }}>
              <TableContainer component={Paper}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ backgroundColor: 'action.hover' }}>
                      <TableCell>Duration</TableCell>
                      <TableCell>Earliest Shift Start Time</TableCell>
                      <TableCell>Latest Shift End Time</TableCell>
                      <TableCell align="left">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={addNewShift}
                        >
                          <i className='ri-add-line' />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {shifts.map((shift, index) => (
                      <React.Fragment key={index}>
                        <TableRow>
                          <TableCell>
                            <div className='flex flex-col'>
                              <TextField
                                type="text"
                                value={shift.duration}
                                onChange={(e) => handleShiftChange(index, 'duration', e.target.value)}
                                InputProps={{
                                  sx: {
                                    width: '72px',
                                    height: '36px',
                                    fontSize: '12px',
                                    ...(shift.durationError && { borderColor: 'red', outline: '1px solid red' })
                                  }
                                }}
                                error={!!shift.durationError}
                                onKeyDown={handleKeyDown}
                                placeholder='Hours'
                              />
                            </div>
                          </TableCell>

                          <TableCell>
                            <div className="flex flex-col">
                              <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <TimePicker
                                  value={dayjs(shift.startTime)}
                                  onChange={(value) => {
                                    if (value) {
                                      handleShiftChange(index, 'startTime', value);
                                    }
                                  }}
                                  ampm
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
                                            display: 'none'
                                          },
                                          msOverflowStyle: 'none',
                                          overflow: 'auto'
                                        },
                                        '& .MuiMultiSectionDigitalClockSection-root': {
                                          scrollbarWidth: 'none',
                                          '&::-webkit-scrollbar': {
                                            display: 'none'
                                          },
                                          msOverflowStyle: 'none',
                                          overflow: 'auto'
                                        },
                                        '& .MuiTimeClockTabs-root': {
                                          scrollbarWidth: 'none',
                                          '&::-webkit-scrollbar': {
                                            display: 'none'
                                          },
                                          msOverflowStyle: 'none',
                                          overflow: 'auto'
                                        }
                                      }
                                    }
                                  }}
                                />
                              </LocalizationProvider>
                            </div>
                          </TableCell>

                          <TableCell>
                            <div className="flex flex-col">
                              <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <TimePicker
                                  value={dayjs(shift.endTime)}
                                  onChange={(value) => {
                                    if (value) {
                                      handleShiftChange(index, 'endTime', value);
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
                                            display: 'none'
                                          },
                                          msOverflowStyle: 'none',
                                          overflow: 'auto'
                                        },
                                        '& .MuiMultiSectionDigitalClockSection-root': {
                                          scrollbarWidth: 'none',
                                          '&::-webkit-scrollbar': {
                                            display: 'none'
                                          },
                                          msOverflowStyle: 'none',
                                          overflow: 'auto'
                                        },
                                        '& .MuiTimeClockTabs-root': {
                                          scrollbarWidth: 'none',
                                          '&::-webkit-scrollbar': {
                                            display: 'none'
                                          },
                                          msOverflowStyle: 'none',
                                          overflow: 'auto'
                                        }
                                      }
                                    }
                                  }}
                                />
                              </LocalizationProvider>
                            </div>
                          </TableCell>

                          <TableCell>
                            <IconButton
                              color="error"
                              size="small"
                              onClick={() => handleRemoveShift(index)}
                            >
                              <i className='ri-delete-bin-7-line' />
                            </IconButton>
                          </TableCell>
                        </TableRow>


                        {shift.durationError && (
                          <TableRow>
                            <TableCell colSpan={4} sx={{ p: 1 }}>
                              <Typography color="error" variant="caption" sx={{ fontSize: '12px', color: 'red', marginLeft: '12px' }}>
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
            name='active'
            control={control}
            render={({ field }) => (
              <FormControlLabel
                style={{ width: '100px' }}
                control={<Checkbox {...field} checked={field.value} />}
                label='Active'
              />
            )}
          />
        </form>
      </DialogContent>

      <DialogActions sx={{ justifyContent: 'space-between', px: 4, py: 3 }}>
        <Button
          variant='contained'
          onClick={handleSubmit(onSubmit)}
          disabled={formErrors.length > 0 || shifts.some(shift => !!shift.durationError)}
        >
          Save
        </Button>
        <Button variant='outlined' color='error' onClick={handleReset}>
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default EditService
