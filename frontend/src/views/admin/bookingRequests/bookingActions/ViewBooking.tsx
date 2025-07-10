import React, { useState } from 'react';
import {
    Button,
    Dialog,
    DialogContent,
    DialogTitle,
    IconButton,
    Typography,
    Divider,
    Chip
} from '@mui/material';
import { getBookingbyIDApiCall } from '../action';
import { useEffect } from 'react';
import { GetFormattedDate, formatTimeTo } from '@/utils/commonFunction';





export const formatToAMPM = (timeStr: string, convertToUtc: boolean): string => {
    const [hoursStr, minutesStr] = timeStr.split(':');
    const hours = parseInt(hoursStr, 10);
    const minutes = parseInt(minutesStr, 10);

    // Convert UTC time to IST (+05:30)
    const date = new Date(Date.UTC(1970, 0, 1, hours, minutes)); // Create UTC date

    if (convertToUtc) {
        date.setMinutes(date.getMinutes() + Math.abs(new Date().getTimezoneOffset())); // Add 5 hours 30 minutes (IST offset)
    }

    const hoursInIST = date.getUTCHours(); // Get IST hours
    const minutesInIST = date.getUTCMinutes(); // Get IST minutes

    // Format to AM/PM
    const period = hoursInIST >= 12 ? 'PM' : 'AM';
    const formattedHours = hoursInIST % 12 === 0 ? 12 : hoursInIST % 12;

    return `${formattedHours}:${minutesInIST.toString().padStart(2, '0')} ${period}`;
};




interface EditBookingProps {
    open: boolean;
    handleClose: () => void;
    bookingData: any; // Replace `any` with a specific type if you have a Booking type/interface
    setActionByViewMode?: (action: 'edit' | 'cancel' | 'confirm' | 'confirmWithOther') => void;

    setConfirmModalOpen?: (open: boolean) => void;
    setConfirmWithOtherCarerModalOpen?: (open: boolean) => void;
    setCancelModalOpen?: (open: boolean) => void;
    setEditModalOpen?: (open: boolean) => void;

    isDashboardMode?: boolean; // Optional, if it's not always passed
}




const ViewBooking: React.FC<EditBookingProps> = ({
    open,
    handleClose,
    bookingData,

    setConfirmModalOpen,
    setConfirmWithOtherCarerModalOpen,
    setCancelModalOpen,
    setEditModalOpen,
    isDashboardMode
}) => {









    const [initData, setInitData] = useState<any>(null)


    useEffect(() => {
        if (open && bookingData?.BookingID) {
            const fetchBookingData = async () => {
                try {
                    const res = await getBookingbyIDApiCall(bookingData.BookingID);
                    setInitData(res[0])
                } catch (error) {
                    console.error('Error fetching booking data:', error);
                }
            };

            fetchBookingData();
        }
    }, [open, bookingData]);



    function getStatus() {
        var status
        if (initData?.BookingStatus == 0) {
            return <Chip className='ms-4' size='small' color="warning" label="Pending" variant="outlined" >{status}</Chip>
        }
        else if (initData?.BookingStatus == 1) {
            return <Chip className='ms-4' size='small' color="success" label="Confirmed" variant="outlined" >{status}</Chip>
        }
        else {
            return <Chip className='ms-4' size='small' color="error" label="Cancelled" variant="outlined" >{status}</Chip>
        }
    }
    function getRecurring() {
        var status
        if (initData?.RecurringBookingID) {
            return <Chip className='ms-4 text-[#28a745] border-[#28a745]' size='small' label="Recurring" variant="outlined" ></Chip>
        }
    }











    return (


        <>

            {initData &&

                <Dialog
                    fullWidth
                    open={open}
                    onClose={handleClose}
                    maxWidth='md'
                    scroll='paper'
                    closeAfterTransition={false}
                    PaperProps={{
                        sx: {
                            borderRadius: '12px',
                            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
                        }
                    }}
                >


                    <DialogTitle
                        sx={{
                            px: 4,
                            py: 3,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                        }}
                    >
                        <div className='flex '>

                            <Typography variant='h5' sx={{ fontWeight: 600 }}>
                                View Booking
                            </Typography>

                            {getStatus()}
                            {getRecurring()}

                        </div>

                        <IconButton
                            onClick={handleClose}>
                            <i className="ri-close-line text-2xl" />
                        </IconButton>

                    </DialogTitle>

                    <Divider />


                    {/* Client Details Section */}
                    <DialogContent sx={{ px: 4, py: 3 }}>
                        <div className="rounded-lg bg-slate-50 p-4 transition-all" style={{ backgroundColor: 'rgba(0, 128, 0, 0.05)' }}>
                            <h3 className="mb-3 font-medium text-slate-900">Client Information</h3>
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                <div>
                                    <p className="font-medium">{initData?.ClientName}</p>
                                    <p className="text-sm text-slate-500">Name</p>
                                </div>
                                <div>
                                    <p className="font-medium">{initData?.ClientEmailID}</p>
                                    <p className="text-sm text-slate-500">Email</p>
                                </div>
                                <div>
                                    <p className="font-medium">{initData?.ClientPhoneNo}</p>
                                    <p className="text-sm text-slate-500">Phone</p>
                                </div>

                                <div>
                                    <p className="font-medium"> {`${formatTimeTo(initData?.BookingDateTime?.split('T')[1])} to ${formatTimeTo(initData?.EndTime?.split('T')[1])}`}</p>
                                    <p className="text-sm text-slate-500">Time</p>
                                </div>

                            </div>
                        </div>



                        <div className='px-4'>

                            {/* Service Details Section */}
                            <div className='my-6 '>
                                <h3 className="mb-3 font-medium text-slate-900">Service Details</h3>
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div className="flex items-start gap-2">
                                        <div>
                                            <p className="font-medium">{bookingData?.ServiceName}</p>
                                            <p className="text-sm text-slate-500">Service</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <div>
                                            <p className="font-medium">{initData?.Duration} Hours</p>
                                            <p className="text-sm text-slate-500">Duration</p>
                                        </div>
                                    </div>

                                </div>
                            </div>


                            {/* Schedule Details */}
                            <div>
                                <h3 className="mb-3 font-medium text-slate-900">Schedule</h3>
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 mb-4">
                                    <div className="flex items-start gap-2">
                                        <div>
                                            <p className="font-medium">
                                                {GetFormattedDate(initData?.BookingDateTime?.split('T')[0])}
                                            </p>
                                            <p className="text-sm text-slate-500">Date</p>
                                        </div>
                                    </div>



                                    <div className="flex items-start gap-2">
                                        <div>
                                            <p className="font-medium">
                                                {bookingData?.CarerName}
                                            </p>
                                            <p className="text-sm text-slate-500">Carer</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-2">
                                        <div>
                                            <p className="font-medium">
                                                {formatTimeTo(initData?.BookingDateTime?.split('T')[1])}
                                            </p>
                                            <p className="text-sm text-slate-500">Start Time</p>
                                        </div>
                                    </div>



                                    <div className="flex items-start gap-2">
                                        <div>
                                            <p className="font-medium">
                                                {formatTimeTo(initData?.EndTime?.split('T')[1])}
                                            </p>
                                            <p className="text-sm text-slate-500">End Time</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-2">
                                        <div>
                                            <p className="font-medium  ">
                                                {initData?.Descr || 'No description provided'}
                                            </p>
                                            <p className="text-sm text-slate-500">Description</p>
                                        </div>
                                    </div>


                                </div>



                            </div>




                            {/* Description */}
                            {initData?.Desc && (
                                <>
                                    <Divider />
                                    <div>
                                        <div className="flex items-start gap-2">
                                            <IconButton className="h-5 w-5 text-slate-500 mt-0.5">
                                                <i className='ri-briefcase-line'></i>
                                            </IconButton>
                                            <div>
                                                <p className="text-sm text-slate-500">Description</p>
                                                <p className="font-medium">{initData?.Desc}</p>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}


                            <div className='flex justify-center pt-4 gap-4'>
                                {/* Confirm - only shown when BookingStatus is not 1 */}
                                {initData?.BookingStatus !== 1 && isDashboardMode !== true && (
                                    <Button
                                        variant='contained'
                                        onClick={() => setConfirmModalOpen(true)}
                                    >
                                        Confirm Booking
                                    </Button>
                                )}

                                {/* Confirm with other carer - always shown */}


                                <Button
                                    variant='contained'
                                    color='info'
                                    onClick={() => setConfirmWithOtherCarerModalOpen(true)}
                                >
                                    Confirm With Other Carer
                                </Button>


                                {/* Cancel - hidden when BookingStatus is 101 */}
                                {initData?.BookingStatus !== 101 && (
                                    <Button
                                        variant='contained'
                                        color='error'
                                        onClick={() => setCancelModalOpen(true)}
                                    >
                                        Cancel Booking
                                    </Button>
                                )}

                                {/* Edit - only shown when BookingStatus is neither 101 nor 1 */}
                                {![101, 1].includes(initData?.BookingStatus) && isDashboardMode !== true && (
                                    <Button
                                        variant='contained'
                                        className='bg-gray-600 hover:bg-gray-800 transition-colors duration-200'
                                        onClick={() => setEditModalOpen(true)}
                                    >
                                        Edit Booking
                                    </Button>
                                )}
                            </div>
                        </div>

                    </DialogContent>

                </Dialog>

            }
        </>

    );
};

export default ViewBooking;