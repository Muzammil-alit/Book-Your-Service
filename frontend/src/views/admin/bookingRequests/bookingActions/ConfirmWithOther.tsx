import { Box, Button, Dialog, DialogActions, DialogTitle, IconButton, Typography } from '@mui/material';
import React from 'react';
import { getClientCarerApiCall } from '@/app/(dashboard)/(private)/client/booking/actions';
import { useEffect, useState } from 'react';

import { Select, MenuItem } from '@mui/material';

interface ConfirmBookingProps {
    open: boolean;
    handleClose: () => void;
    onConfirm: () => void;
    data: any;
    selectedCarer: any;
    setSelectedCarer: (carerID: any) => void;
}


interface Carer {
    CarerID: number | string;
    CarerName: string;
    IsAvailable: boolean;
}



const ConfirmBooking: React.FC<ConfirmBookingProps> = ({
    open,
    handleClose,
    onConfirm,
    data,

    setSelectedCarer
}) => {





    const [carerName, setCarerName] = useState('')
    const [carers, setCarers] = useState<Carer[]>(null)






    useEffect(() => {
        setCarerName(data?.CarerName)

        const selectedCarerObj = carers?.filter((item) => (item.CarerName === data?.CarerName))
        setSelectedCarer(selectedCarerObj && selectedCarerObj[0]?.CarerID)
    }, [data])



    const fetchCarers = async () => {
        try {
            const serviceID = parseInt(data?.ServiceID);
            const serviceDurationID = parseInt(data?.Duration);

            const bookingDateTime = data?.BookingDateTime

            const carers = await getClientCarerApiCall(serviceID, serviceDurationID, bookingDateTime);

            if (Array.isArray(carers)) {
                setCarers(carers);
            }
        } catch (error) {
            console.error("Error fetching timeslots:", error);
        }
    };




    useEffect(() => {
        if (data?.BookingID) {
            fetchCarers();
        }
    }, [data])



    const handleCarerChange = (event: any) => {
        setCarerName(event.target.value)




        const selectedCarerObj = carers.filter((item) => (item.CarerID === event.target.value))
        setSelectedCarer(selectedCarerObj[0].CarerID)
    };




    return (
        <Dialog
            fullWidth
            maxWidth="sm"
            open={open}
            onClose={handleClose}
            closeAfterTransition={false}
        >
            {/* Dialog Title */}
            <DialogTitle className="flex flex-col items-center">
                <Typography className="text-center font-semibold text-blue-500">
                    Confirm with other carer
                </Typography>
                <Typography className="text-center text-gray-500">
                    Confirm this booking with other available carer
                </Typography>
            </DialogTitle>

            {/* Close Button */}
            <IconButton onClick={handleClose} className="absolute block-start-4 inline-end-4">
                <i className="ri-close-line text-gray-500" />
            </IconButton>

            <div className="flex flex-col items-center ">


                {

                    carers?.filter((carer) => carer.IsAvailable).length !== 0 &&

                    <Select
                        fullWidth
                        value={carerName}
                        onChange={handleCarerChange}
                        displayEmpty
                        className="bg-white rounded-lg"
                        sx={{ width: 300 }}
                        size="small"
                    >
                        {carers?.filter((carer) => carer.IsAvailable)
                            .map((carer) => (
                                <MenuItem key={carer.CarerID} value={carer.CarerID}>
                                    {carer.CarerName}
                                </MenuItem>
                            ))}
                    </Select>
                }

                <Box sx={{ width: 300 }}>
                    {carers?.filter((carer) => carer.IsAvailable).length === 0 && (
                        <Typography
                            variant="body1"
                            className="text-red-500 "
                            style={{ alignSelf: 'start' }}
                        >
                            No carer is available on the selected date
                        </Typography>
                    )}

                </Box>
            </div>



            {/* Dialog Actions */}
            <DialogActions className=" flex justify-center gap-4">
                <Button variant="outlined" color="secondary" onClick={handleClose} className="capitalize">
                    Cancel
                </Button>
                <Button
                    variant="contained"
                    onClick={onConfirm}
                    className="capitalize bg-blue-500"
                    disabled={carers?.filter((carer) => carer.IsAvailable).length == 0}
                >
                    Confirm with carer
                </Button>
            </DialogActions>
        </Dialog>

    );

}

export default ConfirmBooking;



