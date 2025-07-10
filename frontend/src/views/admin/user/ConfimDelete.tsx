import { Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Typography } from '@mui/material';
import React from 'react';

interface ConfirmDeleteProps {
    open: boolean;
    handleClose: () => void;
    onConfirm: () => void;
    userID: number;
}

const ConfirmDelete: React.FC<ConfirmDeleteProps> = ({
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
                <Typography className="text-center font-semibold text-red-600">
                    Confirm Deletion
                </Typography>
                <Typography className="text-center text-gray-500">
                    Are you sure you want to delete this user?
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
                    color="error"
                    onClick={onConfirm}
                    className="capitalize"
                >
                    Delete
                </Button>
            </DialogActions>
        </Dialog>

    );

}

export default ConfirmDelete;
