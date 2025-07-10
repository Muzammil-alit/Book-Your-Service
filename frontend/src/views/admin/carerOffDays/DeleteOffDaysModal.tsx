import React, { useState } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  Typography, 
  CircularProgress, 
  Box 
} from '@mui/material';
import { CarerType } from '@/types/apps/carerTypes';
import { CarerOffDayRecord, deleteCarerOffDayApiCall } from './action';

interface DeleteOffDaysModalProps {
  open: boolean;
  onClose: () => void;
  record: CarerOffDayRecord;
  carer: CarerType;
  refreshData: () => void;
}

const DeleteOffDaysModal: React.FC<DeleteOffDaysModalProps> = ({
  open,
  onClose,
  record,
  carer,
  refreshData
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Delete the specific carer off day record
      const success = await deleteCarerOffDayApiCall(carer.CarerID!, record.CarerOffDayID);
      
      if (success) {
        refreshData();
        onClose();
      }
    } catch (err) {
      setError('Failed to delete off days.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formattedDateFrom = new Date(record.DateFrom).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
  const formattedDateTo = new Date(record.DateTo).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Delete Off Days</DialogTitle>
      <DialogContent>
        <Typography variant="body1" sx={{ mb: 2 }}>
          Are you sure you want to delete the off days from {formattedDateFrom} to {formattedDateTo}?
        </Typography>
        
        {error && (
          <Box sx={{ color: 'error.main', mt: 2 }}>
            {error}
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button 
          onClick={handleDelete} 
          variant="contained" 
          color="error" 
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          {loading ? 'Deleting...' : 'Delete'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteOffDaysModal; 