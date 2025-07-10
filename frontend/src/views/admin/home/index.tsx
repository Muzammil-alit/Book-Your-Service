'use client'

import CardStatWithImage from "@/views/admin/home/DashboardCards"
import MonthlyBooking from "@/views/admin/home/RechartsBarChart"
import { useRouter } from 'next/navigation'
import { Grid, Modal, Box, Typography, List, ListItem, ListItemText, IconButton, Chip, Avatar } from '@mui/material'
import { useEffect, useState } from "react"


import dayjs from "dayjs"
import { getDashboardActiveCarersApiCall, getDashboardHeaderApiCall, getDashboardInactiveCarersApiCall, getDashboardMonthlyBookingsApiCall, getDashboardMonthlyBookingsPerCarerApiCall, getDashboardMonthlyBookingsPerServiceApiCall, getDashboardNotificationsApiCall } from "./action"
import TableFilters from "./TableFilters"
import { toast } from "react-toastify"

import { Skeleton } from "@mui/material"


// Helper function to get initials from carer name
const getInitials = (name: string) => {
    const names = name?.split(' ');
    if (names?.length === 1) return names[0]?.charAt(0).toUpperCase();
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
};



const Home = () => {

    const router = useRouter()




    const [filters, setFilters] = useState({
        dateFrom: dayjs().startOf('year'),
        dateTo: dayjs().endOf('year'),
    });





    const [cardData, setCardData] = useState<any>(null)
    const [activeCarers, setActiveCarers] = useState([])
    const [inActiveCarers, setInActiveCarers] = useState([])

    const [dashboardNotification, setDashboardNotification] = useState([])

    const [totalBookings, setTotalBookings] = useState([])
    const [totalBookingsPerService, setTotalBookingsPerService] = useState([])
    const [totalBookingsPerCarer, setTotalBookingsPerCarer] = useState([])


    const [activeModalOpen, setActiveModalOpen] = useState(false)
    const [inActiveModalOpen, setInactiveModalOpen] = useState(false)

    const [loading, setLoading] = useState(false)

    const onFilterChange = (dateFrom: any, dateTo: any) => {

        setFilters({
            ...filters,
            dateFrom: dateFrom && dateFrom ? dateFrom : null,
            dateTo: dateTo && dateTo ? dateTo : null,
        });
    }


    const getDashboardHeader = async () => {
        try {
            setLoading(true)
            const cardsData = await getDashboardHeaderApiCall()
            const activeCarersToday = await getDashboardActiveCarersApiCall()
            const inActiveCarersToday = await getDashboardInactiveCarersApiCall()
            const dashboardNotification = await getDashboardNotificationsApiCall()

            setCardData(cardsData as any)
            setActiveCarers(activeCarersToday as any)
            setInActiveCarers(inActiveCarersToday as any)
            setDashboardNotification(dashboardNotification as any)
        }
        catch (err) {
            toast.error('error fetching dashboard data')
        }
        finally {
            setLoading(false)
        }
    }

    const getChartData = async () => {
        const totalBookings = await getDashboardMonthlyBookingsApiCall(filters.dateFrom, filters.dateTo)
        const totalBookingsPerService = await getDashboardMonthlyBookingsPerServiceApiCall(filters.dateFrom, filters.dateTo)
        const totalBookingsPerCarer = await getDashboardMonthlyBookingsPerCarerApiCall(filters.dateFrom, filters.dateTo)

        setTotalBookings(totalBookings as any)
        setTotalBookingsPerService(totalBookingsPerService as any)
        setTotalBookingsPerCarer(totalBookingsPerCarer as any)
    }

    useEffect(() => {
        getDashboardHeader()
    }, [])



    useEffect(() => {
        getChartData()

    }, [filters.dateFrom, filters.dateTo])


    const handleRedirect = (type: string) => {
        if (type === 'pending') {
            router.push(`/admin/booking-requests?filter=${type}`);
        } else if (type === 'active') {
            setActiveModalOpen(true);
        } else if (type === 'inactive') {
            setInactiveModalOpen(true);
        }
    }

    const handleCloseModal = () => {
        setActiveModalOpen(false);
        setInactiveModalOpen(false);
    }

    const modalStyle = {
        position: 'absolute' as 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 500,
        bgcolor: 'background.paper',
        boxShadow: 24,
        borderRadius: 2,
        p: 4,
        maxHeight: '80vh',
        overflow: 'auto'
    };



    const fetchNotificationData = async () => {

        const dashboardNotification = await getDashboardNotificationsApiCall()
        setDashboardNotification(dashboardNotification as any)
    }

    return (
        <>


            <Grid container spacing={4}>
                {loading ? (
                    <>
                        {[1, 2, 3].map((item) => (
                            <Grid item xs={12} sm={6} md={4} key={item} className="mb-6">
                                <Skeleton variant="rectangular" animation="wave" height={150} sx={{ borderRadius: 2 }} />
                            </Grid>
                        ))}
                    </>
                ) : (
                    <>
                        <Grid item xs={12} sm={6} md={4} className="mb-6">
                            <CardStatWithImage
                                stats={cardData?.TotalPendingBookings ?? 0}
                                title='Pending Booking Requests'
                                trendNumber=''
                                chipColor='primary'
                                chipText='View all '
                                src='/images/dashboard/Pending.png'
                                handleRedirect={handleRedirect}
                                type='pending'
                            />
                        </Grid>

                        <Grid item xs={12} sm={6} md={4}>
                            <CardStatWithImage
                                stats={cardData?.TotalActiveCarers ?? 0}
                                title='Active Carers Today'
                                trendNumber=''
                                chipColor='primary'
                                chipText='View all '
                                src='/images/dashboard/Active.png'
                                handleRedirect={handleRedirect}
                                type='active'
                            />
                        </Grid>

                        <Grid item xs={12} sm={6} md={4}>
                            <CardStatWithImage
                                stats={cardData?.TotalInactiveCarers ?? 0}
                                title='Inactive Carers Today'
                                trendNumber=''
                                chipColor='primary'
                                chipText='View all '
                                src='/images/dashboard/Inactive.png'
                                handleRedirect={handleRedirect}
                                type='inactive'
                            />
                        </Grid>
                    </>
                )}
            </Grid>



            <Grid item xs={12} sm={6} md={4}>

                <TableFilters onFilterChange={onFilterChange} loading={loading} />
            </Grid>

            <MonthlyBooking totalBookings={totalBookings} totalBookingsPerService={totalBookingsPerService} totalBookingsPerCarer={totalBookingsPerCarer} dashboardNotification={dashboardNotification} fetchNotificationData={fetchNotificationData} loading={loading} />




            {/* Active Carers Modal */}
            <Modal
                open={activeModalOpen}
                onClose={handleCloseModal}
                aria-labelledby="active-carers-modal"
                aria-describedby="list-of-active-carers"
            >
                <Box sx={modalStyle}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                        <Typography id="active-carers-modal" variant="h6" component="h2">
                            Active Carers Today
                        </Typography>
                        <IconButton onClick={handleCloseModal}>
                            <i className="ri-close-line"></i>
                        </IconButton>
                    </Box>

                    {activeCarers?.length === 0 && (
                        <Box sx={{ textAlign: 'center', py: 4 }}>
                            <Typography variant="body1" color="text.secondary">
                                No carers carers today
                            </Typography>
                        </Box>
                    )}

                    {/* Group carers into Working and Available */}
                    {(() => {
                        const workingCarers = activeCarers?.filter((carer: any) => carer.IsWorking);
                        const availableCarers = activeCarers?.filter((carer: any) => !carer.IsWorking);

                        return (
                            <>
                                {workingCarers?.length > 0 && (
                                    <>
                                        <Typography variant="subtitle1" fontWeight={600} sx={{ mt: 2, mb: 1 }}>
                                            Working
                                        </Typography>
                                        <List sx={{
                                            '& .MuiListItem-root': {
                                                px: 4,
                                                py: 2,
                                            }
                                        }}>
                                            {workingCarers?.map((carer: any) => {
                                                const profilePic = carer.ProfilePic?.data ?
                                                    `data:image/jpeg;base64,${Buffer.from(carer.ProfilePic.data).toString('base64')}` : null

                                                return (
                                                    <ListItem
                                                        key={carer.CarerID}
                                                        sx={{
                                                            borderLeft: `4px solid ${carer.Color || '#f5a623'}`,
                                                            borderRadius: 1,
                                                            mb: 2,
                                                        }}
                                                        className="bg-gray-50"
                                                    >
                                                        <Box sx={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: 3,
                                                            width: '100%'
                                                        }}>
                                                            <Box sx={{
                                                                width: 40,
                                                                height: 40,
                                                                borderRadius: '50%',
                                                                overflow: 'hidden',
                                                                backgroundColor: 'divider',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center'
                                                            }}>
                                                                <Avatar
                                                                    src={profilePic || undefined}
                                                                    alt={carer.CarerName}
                                                                    sx={{
                                                                        width: 36,
                                                                        height: 36,
                                                                        bgcolor: carer.Color || '#1976d2'
                                                                    }}
                                                                >
                                                                    {getInitials(carer.CarerName)}
                                                                </Avatar>
                                                            </Box>
                                                            <ListItemText
                                                                primary={
                                                                    <>
                                                                        <Typography variant='body1' fontWeight={500}>
                                                                            {carer.CarerName}
                                                                        </Typography>
                                                                        <Typography fontSize={12} fontWeight={400}>
                                                                            {carer.EmailID}
                                                                        </Typography>
                                                                        <Typography fontSize={12} fontWeight={400} color="text.secondary">
                                                                            {`Available from ${dayjs(carer.StartTime).format('hh:mm a')} to ${dayjs(carer.EndTime).format('hh:mm a')}`}
                                                                        </Typography>
                                                                    </>
                                                                }
                                                                sx={{ my: 0 }}
                                                            />
                                                        </Box>
                                                    </ListItem>
                                                )
                                            })}
                                        </List>
                                    </>
                                )}

                                {availableCarers?.length > 0 && (
                                    <>
                                        <Typography variant="subtitle1" fontWeight={600} sx={{ mt: 2, mb: 1 }}>
                                            Available
                                        </Typography>
                                        <List sx={{
                                            '& .MuiListItem-root': {
                                                px: 4,
                                                py: 2,
                                            }
                                        }}>
                                            {availableCarers?.map((carer: any) => {
                                                const profilePic = carer.ProfilePic?.data ?
                                                    `data:image/jpeg;base64,${Buffer.from(carer.ProfilePic.data).toString('base64')}` : null


                                                return (
                                                    <ListItem
                                                        key={carer.CarerID}
                                                        sx={{
                                                            borderLeft: `4px solid ${carer.Color || '#f5a623'}`,
                                                            borderRadius: 1,
                                                            mb: 2,
                                                        }}
                                                        className="bg-gray-50"
                                                    >
                                                        <Box sx={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: 3,
                                                            width: '100%'
                                                        }}>
                                                            <Box sx={{
                                                                width: 40,
                                                                height: 40,
                                                                borderRadius: '50%',
                                                                overflow: 'hidden',
                                                                backgroundColor: 'divider',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center'
                                                            }}>
                                                                <Avatar
                                                                    src={profilePic || undefined}
                                                                    alt={carer.CarerName}
                                                                    sx={{
                                                                        width: 36,
                                                                        height: 36,
                                                                        bgcolor: carer.Color || '#1976d2'
                                                                    }}
                                                                >
                                                                    {getInitials(carer.CarerName)}
                                                                </Avatar>
                                                            </Box>
                                                            <ListItemText
                                                                primary={
                                                                    <>
                                                                        <Typography variant='body1' fontWeight={500}>
                                                                            {carer.CarerName}
                                                                        </Typography>
                                                                        <Typography fontSize={12} fontWeight={400}>
                                                                            {carer.EmailID}
                                                                        </Typography>
                                                                        <Typography fontSize={12} fontWeight={400} color="text.secondary">
                                                                            {`Available from ${dayjs(carer.StartTime).format('hh:mm a')} to ${dayjs(carer.EndTime).format('hh:mm a')}`}
                                                                        </Typography>
                                                                    </>
                                                                }
                                                                sx={{ my: 0 }}
                                                            />
                                                        </Box>
                                                    </ListItem>
                                                )
                                            })}
                                        </List>
                                    </>
                                )}
                            </>
                        );
                    })()}
                </Box>
            </Modal>





            {/* Inactive Carers Modal */}
            <Modal
                open={inActiveModalOpen}
                onClose={handleCloseModal}
                aria-labelledby="active-carers-modal"
                aria-describedby="list-of-active-carers"
            >
                <Box sx={modalStyle}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                        <Typography id="active-carers-modal" variant="h6" component="h2">
                            Inactive Carers Today
                        </Typography>
                        <IconButton onClick={handleCloseModal}>
                            <i className="ri-close-line"></i>
                        </IconButton>
                    </Box>

                    {inActiveCarers?.length === 0 && (
                        <Box sx={{ textAlign: 'center', py: 4 }}>
                            <Typography variant="body1" color="text.secondary">
                                No inactive carers today
                            </Typography>
                        </Box>
                    )}

                    <List sx={{
                        '& .MuiListItem-root': {
                            px: 4,
                            py: 2,
                        }
                    }}>
                        {inActiveCarers?.map((carer: any) => {
                            // Convert buffer to base64 for the image
                            const profilePic = carer.ProfilePic?.data ?
                                `data:image/jpeg;base64,${Buffer.from(carer.ProfilePic.data).toString('base64')}` : null

                            return (
                                <ListItem
                                    key={carer.CarerID}
                                    sx={{
                                        borderLeft: `4px solid ${carer.Color || '#f5a623'}`,
                                        borderRadius: 1,
                                        mb: 2,
                                    }}
                                    className="bg-gray-50"
                                >
                                    <Box sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 3,
                                        width: '100%'
                                    }}>
                                        <Box sx={{
                                            width: 40,
                                            height: 40,
                                            borderRadius: '50%',
                                            overflow: 'hidden',
                                            backgroundColor: 'divider',
                                            display: 'flex',
                                            alignSelf: 'center',
                                            justifyContent: 'center'
                                        }}>
                                            <Avatar
                                                src={profilePic || undefined}
                                                alt={carer.CarerName}
                                                sx={{
                                                    width: 36,
                                                    height: 36,
                                                    bgcolor: carer.Color || '#1976d2'
                                                }}
                                            >
                                                {getInitials(carer.CarerName)}
                                            </Avatar>
                                        </Box>
                                        <ListItemText
                                            primary={
                                                <>
                                                    <Typography variant='body1' fontWeight={500}>
                                                        {carer.CarerName}
                                                    </Typography>

                                                    <Typography fontSize={12} fontWeight={400}>
                                                        {carer.EmailID}
                                                    </Typography>

                                                </>
                                            }
                                            sx={{ my: 0 }}
                                        />

                                        <Chip size='small' variant='tonal' label={carer.Reason} color={carer.Reason == 'Off Day' ? 'error' : 'warning'} />
                                    </Box>
                                </ListItem>
                            )
                        })}
                    </List>


                </Box>
            </Modal>
        </>
    )
}

export default Home