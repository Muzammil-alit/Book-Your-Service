import { Box, Button, Checkbox, Dialog, DialogActions, DialogTitle, FormControlLabel, IconButton, Typography } from '@mui/material';
import React from 'react';

interface RejectBookingProps {
    open: boolean;
    handleClose: () => void;
    onConfirm: () => void;
    recurringBookingID?: number;
    cancelAll: boolean;
    setCancelAll: any;
}

const RejectBooking: React.FC<RejectBookingProps> = ({
    open,
    handleClose,
    onConfirm,
    
    recurringBookingID,
    setCancelAll,
    cancelAll
}) => {

    return (
        <Dialog
            fullWidth
            maxWidth="sm"
            open={open}
            onClose={handleClose}
            closeAfterTransition={false}
        >
            {/* Dialog Title */}
            <DialogTitle className="flex flex-col items-center gap-2 sm:pbs-4 sm:pbe-2 sm:pli-6">
                <Typography className="text-center font-semibold text-red-600">
                    Cancel Booking
                </Typography>
                <Typography className="text-center text-gray-500">
                    Are you sure you want to cancel this booking?
                </Typography>
            </DialogTitle>


            {recurringBookingID &&
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }} >
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={cancelAll}
                                onChange={(e) => setCancelAll(e.target.checked)}
                                color="primary"
                            />
                        }
                        label="Do you want to cancel all linked reccuring bookings?"
                    />

                </Box>
            }




            {/* Close Button */}
            <IconButton onClick={handleClose} className="absolute block-start-4 inline-end-4">
                <i className="ri-close-line text-gray-500" />
            </IconButton>

            {/* Dialog Actions */}
            <DialogActions className="sm:pbe-6 sm:pli-6 flex justify-center gap-4">
                <Button variant="outlined" color="secondary" onClick={handleClose} className="capitalize">
                    Close
                </Button>
                <Button
                    variant="contained"
                    color="error"
                    onClick={onConfirm}
                    className="capitalize"
                >
                    Cancel
                </Button>
            </DialogActions>
        </Dialog>

    );

}

export default RejectBooking;
