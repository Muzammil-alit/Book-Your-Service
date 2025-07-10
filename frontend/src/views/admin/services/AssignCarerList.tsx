import { 
    Button, 
    Checkbox,
    Dialog, 
    DialogActions, 
    DialogContent, 
    DialogTitle, 
    Paper, 
    Table, 
    TableBody, 
    TableCell, 
    TableContainer, 
    TableHead, 
    TableRow, 
    Typography,
} from '@mui/material';
import React, { useEffect, useState } from 'react';

import { useDispatch } from 'react-redux';
import { getCarerListApiCall, getServiceCarersApiCall, updateServiceCarersApiCall } from './action';
import { useAppSelector } from '@/redux/useAppSelector';

type AssignCarerListProps = {
    open: boolean
    setOpen: (open: boolean) => void
    serviceName?: string
    serviceID?: number
}

type CarerType = {
    carerID: number
    CarerName: string
    carerName: string
    isAssigned: boolean
    CarerID: number
    IsAssigned: boolean
}

const AssignCarerList = ({ open, setOpen, serviceName, serviceID }: AssignCarerListProps) => {
    const [localCarers, setLocalCarers] = useState<CarerType[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [savingAssignments, setSavingAssignments] = useState<boolean>(false);
    const dispatch = useDispatch();

    const { carers } = useAppSelector((state) => state.carersReducer);
    
    // Fetch carers and their assignments when the modal opens
    useEffect(() => {
        const loadData = async () => {
            if (open && serviceID) {
                setLoading(true);
                await getCarerListApiCall(dispatch)
                setLoading(false)
            }
        }
        
        loadData();
    }, [open, serviceID, dispatch]);
    



    useEffect(() => {
        if (carers && Array.isArray(carers) && open && serviceID) {
            getServiceCarersApiCall(serviceID).then((assignedCarerData: any) => {
                
                const assignedCarerIds = assignedCarerData.map((carer: any) => carer.CarerID)

                  

                const updatedCarers = carers.map(carer => ({
                    ...carer,
                    IsAssigned: assignedCarerIds.includes(carer.CarerID)
                }));
                
                setLocalCarers(updatedCarers as any);
            });
        }
    }, [carers, serviceID, open]);

    const handleClose = () => {
        setOpen(false);
    }

const handleToggleAssignment = (carerId: number) => {
        setLocalCarers(localCarers.map(carer => 
            carer.CarerID === carerId 
                ? { ...carer, IsAssigned: !carer.IsAssigned } 
                : carer
        ));
    }

    const handleSave = async () => {
        if (!serviceID) return;
        
        setSavingAssignments(true);
        
        // Get the IDs of assigned carers
        const assignedCarerIds = localCarers
            .filter(carer => carer.IsAssigned)
            .map(carer => carer.CarerID);
        
        // Call the updateServiceCarers API function
        const success = await updateServiceCarersApiCall(serviceID, assignedCarerIds);
        
        setSavingAssignments(false);
        
        if (success) {
            handleClose();
        }
    }

    return (
        <Dialog 
            fullWidth 
            open={open} 
            onClose={handleClose} 
            maxWidth='sm' 
            scroll='paper'
        >
            <DialogTitle>
                <div className='flex flex-col items-start'>
                    <Typography variant="h6">{serviceName || '[Service Name]'}</Typography>
                    <Typography variant="subtitle1">Assign Carers</Typography>
                </div>
            </DialogTitle>



             <DialogContent dividers sx={{ pt: 2 }}>
                <TableContainer component={Paper} sx={{ maxHeight: 440 }}>
                    {/* Loading and empty states remain unchanged */}
                    
                    <Table stickyHeader aria-label="carer assignment table" size="small">
                        <TableHead>
                            <TableRow sx={{ backgroundColor: 'action.hover' }}>
                                <TableCell padding="checkbox">Assign</TableCell>
                                <TableCell>Carer Name</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {localCarers.map((carer) => (
                                <TableRow key={carer.CarerID}>
                                    <TableCell padding="checkbox">
                                        <Checkbox
                                            checked={carer.IsAssigned}
                                            onChange={() => handleToggleAssignment(carer.CarerID)}
                                        />
                                    </TableCell>
                                    <TableCell>{carer.CarerName}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </DialogContent>



            <DialogActions sx={{ justifyContent: 'space-between', px: 3, py: 3, mt:6 }}>
                <Button 
                    variant="contained" 
                    onClick={handleSave}
                    disabled={loading || savingAssignments}
                >
                    {savingAssignments ? 'Saving...' : 'Save'}
                </Button>
                <Button 
                    variant="outlined" 
                    color="error" 
                    onClick={handleClose}
                    disabled={loading || savingAssignments}
                >
                    Cancel
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default AssignCarerList;
