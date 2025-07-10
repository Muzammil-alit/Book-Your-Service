'use client'
// Next Imports
import dynamic from 'next/dynamic'

// MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'
import Divider from '@mui/material/Divider'
import { useTheme } from '@mui/material/styles'

// Recharts Imports
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from '@/libs/Recharts'
import type { TooltipProps } from '@/libs/Recharts'
import { Grid, List, ListItem, ListItemIcon, ListItemText, Menu, MenuItem } from '@mui/material'
import { Skeleton } from '@mui/material'




import { useState } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { RootState } from '@/redux/store';
import { updateBookingStatusApiCall } from '../bookingRequests/action'

import RejectBooking from '../bookingRequests/bookingActions/RejectBooking'
import ConfirmWithOther from '../bookingRequests/bookingActions/ConfirmWithOther'
import ViewBooking from '../bookingRequests/bookingActions/ViewBooking'

import { useRouter } from 'next/navigation'
import dayjs from 'dayjs'


// Styled Wrapper
const AppRecharts = dynamic(() => import('@/libs/styles/AppRecharts'))




const getRandomColor = () => {
  const letters = '0123456789ABCDEF'
  let color = '#'
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)]
  }
  return color
}



// Tooltip for Single-Series Chart
const CustomTooltip = ({ active, payload, label }: TooltipProps<any, any>) => {
  if (active && payload && payload.length) {
    return (
      <div className='recharts-custom-tooltip'>
        <Typography color='text.primary'>{label}</Typography>
        <Divider />
        <Box className='flex items-center gap-2.5'>
          <i className='ri-circle-fill text-[10px]' style={{ color: '#294C08' }} />
          <Typography variant='body2'>{`Bookings: ${payload[0].value}`}</Typography>
        </Box>
      </div>
    )
  }
  return null
}

// Tooltip for Multi-Series Chart
const StackedTooltip = ({ active, payload, label }: TooltipProps<any, any>) => {
  if (active && payload && payload.length) {
    return (
      <div className='recharts-custom-tooltip'>
        <Typography color='text.primary'>{label}</Typography>
        <Divider />
        {payload.map(item => (
          <Box key={item.dataKey} className='flex items-center gap-2.5'>
            <i className='ri-circle-fill text-[10px]' style={{ color: item?.fill }} />
            <Typography variant='body2'>{`${item.dataKey}: ${item.value}`}</Typography>
          </Box>
        ))}
      </div>
    )
  }
  return null
}

const formatChartData = (apiData: { BookingYear: number, BookingMonth: number, TotalBookings: number }[]) => {
  return apiData?.map(item => ({
    month: new Date(item.BookingYear, item.BookingMonth - 1).toLocaleString('default', { month: 'short' }),
    bookings: item.TotalBookings
  }));
};

const transformServiceData = (apiData: { BookingYear: number, BookingMonth: number, ServiceName: string, TotalBookings: number }[]) => {
  // Group by month
  const groupedData: Record<string, Record<string, number>> = {};

  apiData?.forEach(item => {
    const monthKey = new Date(item.BookingYear, item.BookingMonth - 1).toLocaleString('default', { month: 'short' });

    if (!groupedData[monthKey]) {
      groupedData[monthKey] = {};
    }

    groupedData[monthKey][item.ServiceName] = item.TotalBookings;
  });

  // Convert to array format
  return Object.keys(groupedData).map(month => ({
    month,
    ...groupedData[month]
  }));
};


const transformCarerData = (apiData: { BookingYear: number, BookingMonth: number, CarerName: string, TotalBookings: number, Color: string }[]) => {
  // Group by month
  const groupedData: Record<string, Record<string, number>> = {};
  const colorMap: Record<string, string> = {};

  apiData?.forEach(item => {
    const monthKey = new Date(item.BookingYear, item.BookingMonth - 1).toLocaleString('default', { month: 'short' });

    if (!groupedData[monthKey]) {
      groupedData[monthKey] = {};
    }

    groupedData[monthKey][item.CarerName] = item.TotalBookings;
    colorMap[item.CarerName] = item.Color;
  });

  // Convert to array format
  return {
    data: Object.keys(groupedData).map(month => ({
      month,
      ...groupedData[month]
    })),
    colors: colorMap
  };
};













function transformData(apiData: any = []) {

  if (!apiData[0]) {
    return
  }



  const [bookings, carerBookings] = apiData;
  const result = [];

  // Process carer unavailable events from bookings
  bookings?.forEach(booking => {
    if (booking.Reason === 'Weekly Off' || booking.Reason === 'Off Day') {
      const event = {
        event: 'carerUnavailable', message: (
          <>
            <span className="font-semibold">{booking.CarerName}</span> has{' '}
            <span className="font-semibold">{booking.Reason}</span> and is not available
          </>
        ),

        messageClient: (
          <>
            <span className="font-semibold">{booking.ClientName}</span> on{' '}
            <span className="font-semibold">
              {dayjs(booking.BookingDateTime).utc().format('MMMM D, YYYY')}
            </span>{' '}
            on{' '}
            <span className="font-semibold">
              {dayjs(booking.BookingDateTime).utc().format('hh:mm a')}
            </span>{' '}
            for{' '}
            <span className="font-semibold">{booking.ServiceName}</span>
          </>
        ),

        date: booking.BookingDateTime,
        color: booking.Color,
        carerID: booking.CarerID,
        BookingID: booking.BookingID,
        CarerName: booking.CarerName,
        Duration: booking.Duration,
        ServiceID: booking.ServiceID,
        BookingDateTime: booking.BookingDateTime,
        ServiceName: booking.ServiceName
      };
      result.push(event);
    }
  });

  // Process multiple booking events from carerBookings
  carerBookings.forEach(carerBooking => {
    if (carerBooking.NoOfBookings > 1) {
      const bookingDate = new Date(carerBooking.BookingDate);
      const dayName = bookingDate.toLocaleDateString('en-US', { weekday: 'long' });
      const formattedDate = bookingDate.toLocaleDateString();

      const event = {
        event: 'multipleBooking', message: (
          <>
            <span className="font-semibold">{carerBooking.CarerName}</span> has{' '}
            <span className="font-semibold">{carerBooking.NoOfBookings}</span> bookings on{' '}
            <span className="font-semibold">{dayName}</span>{' '}
            <span className="font-semibold">
              {dayjs(carerBooking.BookingDate).utc().format('MMMM D, YYYY')}
            </span>
          </>
        ),
        date: carerBooking.BookingDate,
        color: carerBooking.Color,
        carerID: carerBooking.CarerID,
        BookingID: carerBooking.BookingID,
        CarerName: carerBooking.CarerName
      };
      result.push(event);
    }
  });

  // Sort by date in ascending order
  result.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return result.map(({ ...rest }) => rest); // Remove the temporary date property
}

function formatDateTime(dateTimeString: string): string {
  const date = new Date(dateTimeString);
  return date.toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}















// --------------------------------------------------------------------------------------------------------------------------------------------------------------------



// Main Component
const MonthlyBooking = ({ totalBookings, totalBookingsPerService, totalBookingsPerCarer, dashboardNotification, fetchNotificationData, loading }) => {





  const router = useRouter()
  const theme = useTheme()


  const loggedInUserID = useSelector((state: RootState) => state.authReducer?.admin?.user?.userID);

  // Menu state
  const [anchorPosition, setAnchorPosition] = useState<{ top: number; left: number } | null>(null);
  const [selectedNotification, setSelectedNotification] = useState(null);

  const [confirmWithOtherCarerModalOpen, setConfirmWithOtherCarerModalOpen] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false)
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [cancelAll, setCancelAll] = useState(false);


  const [selectedCarer, setSelectedCarer] = useState(null)

  // Transform the API data
  const formattedTotalBookings = formatChartData(totalBookings);
  const formattedServiceData = transformServiceData(totalBookingsPerService);
  const { data: formattedCarerData, colors: carerColorMap } = transformCarerData(totalBookingsPerCarer);

  // Get unique service names for legend and bars
  const serviceNames = [...new Set(totalBookingsPerService?.map(item => item.ServiceName))];
  const serviceColorMap: Record<string, string> = Object.fromEntries(
    serviceNames.map(name => [name, getRandomColor()])
  );

  // Get unique carer names
  const carerNames = [...new Set(totalBookingsPerCarer?.map(item => item.CarerName))];

  const notificationData = transformData(dashboardNotification)

  const handleNotificationClick = (event: React.MouseEvent, notification: any) => {

    if (notification.event == 'carerUnavailable') {
      setSelectedNotification(notification);
      setAnchorPosition({
        top: event.clientY,
        left: event.clientX
      });
    }
    else {

      router.push(`/admin/calendar?carerId=${notification.carerID}&month=${dayjs(notification.date).month()}`);

    }
  };

  const handleMenuClose = () => {
    setAnchorPosition(null);
  };




  const handleCancelBooking = async () => {

    try {
      const res = await updateBookingStatusApiCall(selectedNotification?.BookingID, 101, null, loggedInUserID, null, null, true)
      if (res?.isOk) {
        toast.success('Booking cancelled successfully')
        // fetchBookings()
        setCancelModalOpen(false)
        setViewModalOpen(false)
        fetchNotificationData()
      }
    } catch (err) {

    }
  }

  const handleConfirmWithOther = async () => {
    try {
      const res = await updateBookingStatusApiCall(selectedNotification?.BookingID, 1, selectedCarer, loggedInUserID)
      if (res?.isOk) {
        toast.success('Booking confirmed with the selected carer')
        // fetchBookings()
        setConfirmWithOtherCarerModalOpen(false)
        setViewModalOpen(false)
      }
    } catch (err) {

    }
  }









  return (

    <>
      <Grid container columnSpacing={6}>
        {loading ? (
          <>
            {/* Skeletons for each chart card */}
            <Grid item xs={12} md={6}>
              <Skeleton variant="rectangular" animation="wave" height={420} sx={{ borderRadius: 2 }} className='mb-6 mt-3' />
            </Grid>
            <Grid item xs={12} md={6}>
              <Skeleton variant="rectangular" animation="wave" height={420} sx={{ borderRadius: 2 }} className='mb-6 mt-3' />
            </Grid>
            <Grid item xs={12} md={6}>
              <Skeleton variant="rectangular" animation="wave" height={420} sx={{ borderRadius: 2 }} className='mb-6' />
            </Grid>
            <Grid item xs={12} md={6}>
              <Skeleton variant="rectangular" animation="wave" height={420} sx={{ borderRadius: 2 }} className='mb-6' />
            </Grid>
          </>
        ) : (


          <>




            {/* Total Bookings Full Width */}
            <Grid item xs={6}>
              <Card className='mb-6 mt-3' sx={{ maxHeight: '440px' }}>
                <CardHeader title='Total Bookings' />
                <CardContent>
                  <AppRecharts>
                    <div className='bs-[350px]'>
                      <ResponsiveContainer>
                        <BarChart
                          height={350}
                          data={formattedTotalBookings}
                          barSize={20}
                          style={{ direction: theme.direction }}
                          margin={{ left: -20 }}
                        >
                          <CartesianGrid strokeDasharray='3 3' />
                          <XAxis dataKey='month' reversed={theme.direction === 'rtl'} />
                          <YAxis orientation={theme.direction === 'rtl' ? 'right' : 'left'} />
                          <Tooltip content={<CustomTooltip />} />
                          <Bar dataKey='bookings' fill='#4D752F' radius={[10, 10, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </AppRecharts>
                </CardContent>
              </Card>
            </Grid>



            {/* Notification List */}
            <Grid item xs={6}>
              <Card className="mb-6 mt-3" sx={{
                maxHeight: '440px',
                minHeight: '440px',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <CardHeader title="Notifications" />
                <CardContent
                  sx={{
                    overflowY: 'auto',
                    flexGrow: 1,
                    px: 5,
                    pt: 1,
                    pb: 0,
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: '40px',
                      background: 'linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(255,255,255,1) 70%)',
                      pointerEvents: 'none'
                    }
                  }}
                >
                  <List
                    sx={{
                      pb: 3,
                      '& .MuiListItem-root': {},
                    }}
                  >


                    {notificationData?.length == 0 ?
                      <div className='flex justify-center items-center h-[300px]'>
                        <Typography variant='body2' >Nothing to see here</Typography>
                      </div>
                      :

                      notificationData?.map((carer, index) => (
                        <ListItem
                          key={index}
                          onClick={(e) => handleNotificationClick(e, carer)}
                          sx={{
                            borderLeft: `4px solid ${carer.color || '#f5a623'}`,
                            borderRadius: 1,
                            mb: 2,
                            cursor: 'pointer',
                            transition: 'transform 0.2s ease-in-out',
                            '&:hover': {
                              transform: 'scale(1.01)',
                              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                            },
                            '&:active': {
                              transform: 'scale(0.99)',
                            }
                          }}
                          className="bg-gray-50"
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                            <ListItemText
                              primary={
                                <>
                                  <Typography variant="body2" fontWeight={500}>
                                    {carer.message}
                                  </Typography>
                                  <Typography variant="body2" fontWeight={500}>
                                    {carer.messageClient}
                                  </Typography>
                                </>
                              }
                              sx={{ my: 0 }}
                            />
                          </Box>
                        </ListItem>
                      ))
                    }


                  </List>
                </CardContent>
              </Card>
            </Grid>













            {/* Total Bookings per Service */}
            <Grid item xs={12} md={6}>
              <Card className='mb-6' sx={{ maxHeight: '440px' }} >
                <CardHeader title='Total Bookings per Service' />
                <CardContent>
                  <AppRecharts>
                    <div className='bs-[350px]'>
                      <ResponsiveContainer>
                        <BarChart
                          height={350}
                          data={formattedServiceData}
                          barSize={20}
                          style={{ direction: theme.direction }}
                          margin={{ left: -20 }}
                        >
                          <CartesianGrid strokeDasharray='3 3' />
                          <XAxis dataKey='month' reversed={theme.direction === 'rtl'} />
                          <YAxis orientation={theme.direction === 'rtl' ? 'right' : 'left'} />
                          <Tooltip content={<StackedTooltip />} />
                          <Legend
                            wrapperStyle={{ paddingTop: '8px' }}
                            content={({ payload }) => (
                              <Box display="flex" flexWrap="wrap" justifyContent="center" gap={2} mt={2}>
                                {payload?.map((entry, index) => (
                                  <Box key={`item-${index}`} display="flex" alignItems="center" gap={1}>
                                    <span
                                      style={{
                                        display: 'inline-block',
                                        width: 10,
                                        height: 10,
                                        borderRadius: '50%',
                                        backgroundColor: entry.color
                                      }}
                                    />
                                    <Typography variant="body2" color="text.primary">
                                      {entry.value}
                                    </Typography>
                                  </Box>
                                ))}
                              </Box>
                            )}
                          />
                          {serviceNames.map((name, index) => (
                            <Bar
                              key={name}
                              dataKey={name}
                              stackId='a'
                              fill={serviceColorMap[name as any]}
                              name={name}
                              radius={index === serviceNames.length - 1 ? [10, 10, 0, 0] : [0, 0, 0, 0]}
                            />
                          ))}
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </AppRecharts>
                </CardContent>
              </Card>
            </Grid>

            {/* Total Bookings per Carer */}
            <Grid item xs={12} md={6}>
              <Card className='mb-6' sx={{ maxHeight: '440px' }} >
                <CardHeader title='Total Bookings per Carer' />
                <CardContent>
                  <AppRecharts>
                    <div className='bs-[350px]'>
                      <ResponsiveContainer>
                        <BarChart
                          height={350}
                          data={formattedCarerData}
                          barSize={20}
                          style={{ direction: theme.direction }}
                          margin={{ left: -20 }}
                        >
                          <CartesianGrid strokeDasharray='3 3' />
                          <XAxis dataKey='month' reversed={theme.direction === 'rtl'} />
                          <YAxis orientation={theme.direction === 'rtl' ? 'right' : 'left'} />
                          <Tooltip content={<StackedTooltip />} />
                          <Legend
                            wrapperStyle={{ paddingTop: '8px' }}
                            content={({ payload }) => (
                              <Box display="flex" flexWrap="wrap" justifyContent="center" gap={2} mt={2}>
                                {payload?.map((entry, index) => (
                                  <Box key={`item-${index}`} display="flex" alignItems="center" gap={1}>
                                    <span
                                      style={{
                                        display: 'inline-block',
                                        width: 10,
                                        height: 10,
                                        borderRadius: '50%',
                                        backgroundColor: entry.color
                                      }}
                                    />
                                    <Typography variant="body2" color="text.primary">
                                      {entry.value}
                                    </Typography>
                                  </Box>
                                ))}
                              </Box>
                            )}
                          />
                          {carerNames.map((name, index) => (
                            <Bar
                              key={name}
                              dataKey={name}
                              stackId='a'
                              fill={carerColorMap[name as any]}
                              name={name}
                              radius={index === carerNames.length - 1 ? [10, 10, 0, 0] : [0, 0, 0, 0]}
                            />
                          ))}
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </AppRecharts>
                </CardContent>
              </Card>
            </Grid>
          </>
        )}
      </Grid>


      {/* Context Menu for Notifications */}
      <Menu
        anchorReference="anchorPosition"
        anchorPosition={anchorPosition}
        open={Boolean(anchorPosition)}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
      >


        <MenuItem onClick={() => {
          setConfirmWithOtherCarerModalOpen(true);
          handleMenuClose();
        }}>
          <ListItemIcon>
            <i className="ri-user-follow-line text-blue-600" />
          </ListItemIcon>
          <ListItemText>Confirm With Other Carer</ListItemText>
        </MenuItem>




        <MenuItem onClick={() => {
          setCancelModalOpen(true);
          handleMenuClose();
        }}>
          <ListItemIcon>
            <i className="ri-close-line text-red-600" />
          </ListItemIcon>
          <ListItemText>Cancel Booking</ListItemText>
        </MenuItem>

        <MenuItem onClick={() => {
          setViewModalOpen(true);
          handleMenuClose();
        }}>
          <ListItemIcon>
            <i className="ri-eye-line text-blue-800 text-xl" />
          </ListItemIcon>
          <ListItemText>View Booking</ListItemText>
        </MenuItem>



      </Menu>

      {confirmWithOtherCarerModalOpen &&
        <ConfirmWithOther
          setSelectedCarer={setSelectedCarer}
          selectedCarer={selectedCarer}
          data={selectedNotification}
          open={confirmWithOtherCarerModalOpen}
          handleClose={() => { setConfirmWithOtherCarerModalOpen(false) }}
          onConfirm={handleConfirmWithOther}
        />
      }

      {cancelModalOpen &&
        <RejectBooking
          open={cancelModalOpen}
          handleClose={() => setCancelModalOpen(false)}
          onConfirm={handleCancelBooking}

          setCancelAll={setCancelAll}
          cancelAll={cancelAll}
        />
      }

      <ViewBooking
        open={viewModalOpen}
        handleClose={() => { setViewModalOpen(false) }}
        bookingData={selectedNotification}

        setConfirmWithOtherCarerModalOpen={setConfirmWithOtherCarerModalOpen}
        setCancelModalOpen={setCancelModalOpen}
        isDashboardMode={true}
      />


    </>
  )
}

export default MonthlyBooking


