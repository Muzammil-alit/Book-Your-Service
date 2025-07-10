import { Button, Dialog, DialogActions, DialogTitle, IconButton, Typography } from '@mui/material';
import React from 'react';

interface ConfirmBookingProps {
    open: boolean;
    handleClose: () => void;
    onConfirm: () => void;
}

const ConfirmBooking: React.FC<ConfirmBookingProps> = ({
    open,
    handleClose,
    onConfirm,
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
                <Typography className="text-center font-semibold text-green-600">
                    Confirm Booking
                </Typography>
                <Typography className="text-center text-gray-500">
                    Are you sure you want to confirm this booking?
                </Typography>
            </DialogTitle>

            {/* Close Button */}
            <IconButton onClick={handleClose} className="absolute block-start-4 inline-end-4">
                <i className="ri-close-line text-gray-500" />
            </IconButton>

            {/* Dialog Actions */}
            <DialogActions className="sm:pbe-6 sm:pli-6 flex justify-center gap-4">
                <Button variant="outlined" color="secondary" onClick={handleClose} className="capitalize">
                    Cancel
                </Button>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={onConfirm}
                    className="capitalize"
                >
                    Confirm
                </Button>
            </DialogActions>
        </Dialog>

    );

}

export default ConfirmBooking;
