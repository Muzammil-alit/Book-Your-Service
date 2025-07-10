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
    CircularProgress
} from '@mui/material';
import React, { useEffect, useState } from 'react';

import { useDispatch } from 'react-redux';
import { getServiceListApiCall, getCarerServicesApiCall, updateCarerServicesApiCall } from './action';
import { useAppSelector } from '@/redux/useAppSelector';

type AssignServiceListProps = {
    open: boolean
    setOpen: (open: boolean) => void
    carerName?: string
    carerID?: number
}

type ServiceType = {
    ServiceID: number
    ServiceName: string
    IsAssigned: boolean
}

const AssignServiceList = ({ open, setOpen, carerName, carerID }: AssignServiceListProps) => {
    const [localServices, setLocalServices] = useState<ServiceType[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [savingAssignments, setSavingAssignments] = useState<boolean>(false);
    const dispatch = useDispatch();

    const { services } = useAppSelector((state) => state.servicesReducer);
      
    
    // Fetch services and their assignments when the modal opens
    useEffect(() => {
        const loadData = async () => {
            if (open && carerID) {
                setLoading(true);
                await getServiceListApiCall(dispatch)
                setLoading(false)
            }
        }
        
        loadData();
    }, [open, carerID, dispatch]);
    
    useEffect(() => {
        if (services && Array.isArray(services) && open && carerID) {
            getCarerServicesApiCall(carerID).then(assignedServiceData => {
                const assignedServiceIds = assignedServiceData.map(service => service.ServiceID)
                

                const updatedServices = services.map(service => ({
                    ...service,
                    IsAssigned: assignedServiceIds.includes(service.ServiceID)
                }));
                
                setLocalServices(updatedServices);
            });
        }
    }, [services, carerID, open]);

    const handleClose = () => {
        setOpen(false);
    }

    const handleToggleAssignment = (ServiceId: number) => {
        setLocalServices(localServices.map(service => 
            service.ServiceID === ServiceId 
                ? { ...service, IsAssigned: !service.IsAssigned } 
                : service
        ));
    }

    const handleSave = async () => {
        if (!carerID) return;
        
        setSavingAssignments(true);
        
        // Get the IDs of assigned services
        const assignedServiceIds = localServices
            .filter(service => service.IsAssigned)
            .map(service => service.ServiceID);
        
        // Call the updateCarerServices API function
        const success = await updateCarerServicesApiCall(carerID, assignedServiceIds);
        
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
                    <Typography variant="h6">{carerName || '[Carer Name]'}</Typography>
                    <Typography variant="subtitle1">Assign Services</Typography>
                </div>
            </DialogTitle>
            <DialogContent dividers sx={{ pt: 2 }}>
                <TableContainer component={Paper} sx={{ maxHeight: 440 }}>
                    { localServices.length === 0 ? (
                        <div className="flex justify-center items-center p-8">
                            <Typography variant="body1" color="text.secondary">
                                No services available
                            </Typography>
                        </div>
                    ) : (
                        <Table stickyHeader aria-label="service assignment table" size="small">
                            <TableHead>
                                <TableRow sx={{ backgroundColor: 'action.hover' }}>
                                    <TableCell padding="checkbox">Assign</TableCell>
                                    <TableCell>Service Name</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {localServices.map((service) => (
                                    <TableRow key={service.ServiceID}>
                                        <TableCell padding="checkbox">
                                            <Checkbox
                                                checked={service.IsAssigned}
                                                onChange={() => handleToggleAssignment(service.ServiceID)}
                                            />
                                        </TableCell>
                                        <TableCell>{service.ServiceName}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
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

export default AssignServiceList;
