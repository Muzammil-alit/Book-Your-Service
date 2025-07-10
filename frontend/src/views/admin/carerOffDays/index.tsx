'use client'

import React, { useState, useEffect } from 'react';

// Next Imports
import { useSearchParams } from 'next/navigation';

// MUI Imports
import {
  Box,
  Card,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  ToggleButtonGroup,
  ToggleButton,
  SelectChangeEvent,
  Grid,
  Button,
  Tooltip,
  TextField
} from '@mui/material';

// Components
import CarerOffDaysTable from './CarerOffDaysTable';
import CalendarView from './CalendarView';
import TableFilters from './TableFilters';

// Types & API
import { CarerType } from '@/types/apps/carerTypes';
import { getCarerLookupListApiCall, getCarerOffDaysApiCall, CarerOffDayRecord } from './action';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';

const CarerOffDaysConfig = () => {
  const dispatch = useDispatch();
  const searchParams = useSearchParams();
  const carerIdFromURL = searchParams?.get('carerId') ? Number(searchParams.get('carerId')) : null;

  // State management
  const [carers, setCarers] = useState<CarerType[]>([]);
  const [selectedCarer, setSelectedCarer] = useState<CarerType | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('calendar');
  const [loading, setLoading] = useState<boolean>(true);
  const [offDays, setOffDays] = useState<CarerOffDayRecord[]>([]);
  const [calendarDataChanged, setCalendarDataChanged] = useState<boolean>(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<CarerOffDayRecord | null>(null);
  const [filteredData, setFilteredData] = useState<CarerOffDayRecord[]>([]);
  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>({});
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);


  const [globalFilter, setGlobalFilter] = useState('');

  // Column picker menu state
  const open = Boolean(anchorEl);

  // Fetch carers for dropdown
  useEffect(() => {
    const fetchCarers = async () => {
      setLoading(true);
      const carerList = await getCarerLookupListApiCall(dispatch);

      setCarers(carerList);

      // If we have a carerId from URL, select that carer
      if (carerIdFromURL && carerList.length > 0) {
        const carerFromURL = carerList.find(carer => carer.CarerID === carerIdFromURL);
        if (carerFromURL) {
          setSelectedCarer(carerFromURL);
        }
      }

      setLoading(false);
    };

    fetchCarers();
  }, [dispatch, carerIdFromURL]);



  const fetchOffDays = async () => {
    setLoading(true)
    try {
      if (selectedCarer?.CarerID) {
        const offDaysData = await getCarerOffDaysApiCall(selectedCarer.CarerID);
        setOffDays(offDaysData?.offDays || []);
        setFilteredData(offDaysData?.offDays || []);
      }

    }
    catch (error) {
      toast.error(error)
    }
    finally {
      setLoading(false)
    }

  };

  // Fetch off days when carer changes
  useEffect(() => {
    if (selectedCarer) {
      fetchOffDays();
    }
  }, [selectedCarer]);

  // Handle carer selection
  const handleCarerChange = (event: SelectChangeEvent<number>) => {
    const carerID = event.target.value as number;
    const selectedCarer = carers.find(carer => carer.CarerID === carerID) || null;
    setSelectedCarer(selectedCarer);
  };

  // Handle view mode change
  const handleViewModeChange = (
    _event: React.MouseEvent<HTMLElement>,
    newMode: 'list' | 'calendar' | null
  ) => {
    if (newMode !== null) {
      if (viewMode === 'calendar' && newMode === 'list' && calendarDataChanged) {
        refreshData();
        setCalendarDataChanged(false);
      }
      setViewMode(newMode);
    }
  };

  // Refresh data function
  const refreshData = async () => {
    await fetchOffDays();
  };

  // Callback for when calendar data is changed
  const handleCalendarDataChange = () => {
    setCalendarDataChanged(true);
  };

  // Column visibility handlers
  const handleColumnMenuClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleColumnMenuClose = () => {
    setAnchorEl(null);
  };

  const handleToggleAllColumns = () => {
    // Implement this based on your table implementation
  };

  const handleResetColumnVisibility = () => {
    // Implement this based on your table implementation
  };

  // Handle add new off days
  const handleAddOffDays = () => {
    setSelectedRecord(null);
    setAddModalOpen(true);
  };

  // Handle edit and delete actions
  const handleEdit = (record: CarerOffDayRecord) => {
    setSelectedRecord(record);
    // You might want to set edit modal open state here
  };

  const handleDelete = (record: CarerOffDayRecord) => {
    setSelectedRecord(record);
    // You might want to set delete modal open state here
  };

  return (
    <Card>


      <Grid container spacing={2} alignItems="center" className={`px-4  ${viewMode == 'calendar' ? 'py-4' : ''}`}>


        {/* Carer Select Dropdown */}
        <Grid item xs={12} sm={2}>
          <FormControl fullWidth size="small">
            <InputLabel id="carer-select-label">Select Carer</InputLabel>
            <Select
              labelId="carer-select-label"
              value={selectedCarer?.CarerID || ''}
              label="Select Carer"
              onChange={handleCarerChange}
              disabled={loading}
            >
              {carers.map((carer) => (
                <MenuItem key={carer.CarerID} value={carer.CarerID}>
                  {carer.CarerName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

        </Grid>

        {/* Table Filters (only visible in list view) */}
        {viewMode === 'list' && selectedCarer && (
          <Grid item xs={12} sm={6}>
            <TableFilters setData={setFilteredData} tableData={offDays} loading={loading} />
          </Grid>
        )}





        {viewMode === 'list' && selectedCarer && (
        <Grid item xs={12} sm="auto">
          <TextField
            value={globalFilter ?? ''}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Search Off Days"
            variant="outlined"
            sx={{ width: 200 }}
            size="small"
            className="w-[200px] md:w-[250px] lg:w-[300px] "
          />
        </Grid>
        )}

        {/* Spacer to push right-aligned items to the right */}
        <Grid item xs flexGrow={1} />

        {/* View Toggle and Action Buttons (only visible in list view) */}
        {viewMode === 'list' && selectedCarer && (
          <Grid item xs="auto" className="mb-3">
            <Box display="flex" alignItems="center" gap={2}>
              <Tooltip title="Show/Hide Columns">
                <Button
                  variant="outlined"
                  onClick={handleColumnMenuClick}
                  startIcon={<i className="ri-table-line" />}
                  endIcon={<i className={open ? "ri-arrow-up-s-line" : "ri-arrow-down-s-line"} />}
                  size="small"
                  className='h-[40px]'
                >
                  Columns
                </Button>
              </Tooltip>

              <Button
                variant='contained'
                color='primary'
                onClick={handleAddOffDays}
                size='small'
                className='h-[40px]'
              >
                Add Off Days
              </Button>
            </Box>


          </Grid>
        )}

        {/* View Toggle (always visible) */}
        <Grid item xs="auto" className='mb-3'>
          <ToggleButtonGroup
            exclusive
            value={viewMode}
            onChange={handleViewModeChange}
            aria-label="view mode"
            className='h-[40px]'
          >
            <ToggleButton value="calendar" aria-label="calendar view">
              <i className="ri-calendar-line" />
            </ToggleButton>
            <ToggleButton value="list" aria-label="list view">
              <i className="ri-list-check" />
            </ToggleButton>
          </ToggleButtonGroup>
        </Grid>
      </Grid>

      {/* Table controls (only visible in list view) */}



      <>
        {!selectedCarer ? (
          <Typography align="center" sx={{ py: 80 }}>
            Please select a carer to view their off days
          </Typography>
        ) : (
          <>
            {viewMode === 'list' ? (
              <CarerOffDaysTable
                data={filteredData}
                carer={selectedCarer}
                refreshData={refreshData}
                onEdit={handleEdit}
                onDelete={handleDelete}
                columnVisibility={columnVisibility}
                onColumnVisibilityChange={setColumnVisibility}
                loading={loading}

                addModalOpen={addModalOpen}
                setAddModalOpen={setAddModalOpen}

                anchorEl={anchorEl}
                open={open}
                handleColumnMenuClose={handleColumnMenuClose}

                globalFilter={globalFilter}
              />
            ) : (
              <CalendarView
                carer={selectedCarer}
                onDataChange={handleCalendarDataChange}

              />
            )}
          </>
        )}
      </>

      {/* Modals would go here */}
    </Card>
  );
};

export default CarerOffDaysConfig;