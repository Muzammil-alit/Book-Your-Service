import React, { useState, useMemo } from 'react'
import Card from '@mui/material/Card'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import TablePagination from '@mui/material/TablePagination'

// Third-party Imports
import classnames from 'classnames'
import { rankItem } from '@tanstack/match-sorter-utils'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getFilteredRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFacetedMinMaxValues,
  getPaginationRowModel,
  getSortedRowModel,

  getGroupedRowModel,
  getExpandedRowModel
} from '@tanstack/react-table'
import type { ColumnDef, FilterFn } from '@tanstack/react-table'
import type { RankingInfo } from '@tanstack/match-sorter-utils'

// Style Imports
import tableStyles from '@core/styles/table.module.css'
import { Chip, Divider, Tooltip, Button, FormGroup, FormControlLabel, Checkbox, Skeleton, } from '@mui/material'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import ToggleButton from '@mui/material/ToggleButton'
import TableFilters from '../TableFilters'
import dayjs from 'dayjs'

import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'

import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'

import ConfirmBooking from '../bookingActions/ConfirmBooking'
import RejectBooking from '../bookingActions/RejectBooking'
import ConfirmWithOther from '../bookingActions/ConfirmWithOther'
import { updateBookingStatusApiCall } from '../action'
import { toast } from 'react-toastify'
import EditBookingDialog from '../bookingActions/EditBooking'

import { getMyBookingsWithFiltersApiCall } from "../action";
import ViewBooking from '../bookingActions/ViewBooking'
import { useEffect } from 'react'
import BookingRequestCalendar from '../bookingCalendar/BookingRequestCalendar'

import { motion, AnimatePresence } from 'framer-motion'
import { useSelector } from 'react-redux'
import { RootState } from '@/redux/store'

import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import isBetween from 'dayjs/plugin/isBetween';
import { BookingRequestType } from '@/types/apps/bookingRequestsType'
import { GetFormattedDateTimeUTCString } from '@/utils/commonFunction'
import { Grid } from '@mui/system'
import AddNewBooking from '../../calendar/AddNewBooking'




interface Filters {
  userID: string;
  dateFrom: string;
  dateTo: string;
  bookingType: number | null;
}


interface BookingRequestsListTableProps {
  tableData?: BookingRequestType[];
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
  bookingType?: any
}

declare module '@tanstack/table-core' {
  interface FilterFns {
    fuzzy: FilterFn<unknown>
  }
  interface FilterMeta {
    itemRank: RankingInfo
  }
}

type BookingRequestTypeWithAction = BookingRequestType & {
  RecurringBookingID: any
  action?: string
}

const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
  // Rank the item
  const itemRank = rankItem(row.getValue(columnId), value)

  // Store the itemRank info
  addMeta({
    itemRank
  })

  // Return if the item should be filtered in/out
  return itemRank.passed
}

// Column Definitions
const columnHelper = createColumnHelper<BookingRequestTypeWithAction>()

const BookingRequestsListTable: React.FC<BookingRequestsListTableProps> = ({ filters, setFilters }) => {
  // States
  const [rowSelection, setRowSelection] = useState({})
  const [data, setData] = useState<BookingRequestType[]>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [selectedBooking, setSelectedBooking] = useState<any>([]);
  const [anchorElMenu, setAnchorElMenu] = useState<null | HTMLElement>(null);

  const [showFilters, setShowFilters] = useState(false)

  const [cancelAll, setCancelAll] = useState<any>(false);


  dayjs.extend(utc);
  dayjs.extend(timezone);
  dayjs.extend(isBetween);
  dayjs.extend(timezone);






  const [actionByViewMode, setActionByViewMode] = useState('')

  const [confirmModal, setConfirmModal] = useState(false);
  const [confirmWithOthersModal, setConfirmWithOthersModal] = useState(false);
  const [rejectModal, setRejectModal] = useState(false);

  const [editModal, setEditModal] = useState(false)

  const [selectedCarer, setSelectedCarer] = useState('')

  const [bookings, setBookings] = useState<BookingRequestType[]>([]);
  const [loading, setLoading] = useState(false)


  const [addBooking, setAddBooking] = useState(false)





  // View modes
  const [viewModal, setViewModal] = useState(false)

  const [viewMode, setViewMode] = useState<'list' | 'card'>(() => {
    const savedViewMode = localStorage.getItem('bookingViewMode');
    return savedViewMode === 'card' ? 'card' : 'list';
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('bookingViewMode', viewMode);
    }
  }, [viewMode]);



  useEffect(() => {
    let timeout: NodeJS.Timeout | null = null;
    if (viewMode === 'list') {
      setShowFilters(true);
    } else {
      timeout = setTimeout(() => setShowFilters(false), 300); // 300ms delay
    }
    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [viewMode]);

  const handleViewModeChange = (
    event: React.MouseEvent<HTMLElement>,
    newViewMode: 'list' | 'card' | null,
  ) => {
    if (newViewMode !== null) {
      setViewMode(newViewMode);
    }
  };


  React.useEffect(() => {
    if (bookings && bookings?.length > 0) {
      setData(bookings);
    } else {
      setData([]);
    }
  }, [bookings]);






  // Column visibility state
  const [columnVisibility, setColumnVisibility] = useState(() => {
    // Default visibility (hide audit columns by default)
    const defaultVisibility = {
      createdOn: false,
      createdBy: false,
      updatedOn: false,
      updatedBy: false
    };

    // Only run localStorage code on client side
    if (typeof window !== 'undefined') {
      // Load saved column visibility from localStorage
      const savedVisibility = localStorage.getItem('bookingRequestsColumnVisibility')

      // If saved visibility exists, use it
      if (savedVisibility) {
        try {
          return JSON.parse(savedVisibility);
        } catch (e) {
          console.error('Error parsing saved column visibility', e);
        }
      }
    }

    return defaultVisibility;
  });

  // Save column visibility to localStorage when it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('bookingRequestsColumnVisibility', JSON.stringify(columnVisibility));
    }
  }, [columnVisibility]);

  // Column picker menu state
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)

  const handleColumnMenuClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleColumnMenuClose = () => {
    setAnchorEl(null)
  }

  const handleToggleAllColumns = () => {
    const allLeafColumns = table.getAllLeafColumns()
    const allColumnsVisible = allLeafColumns.every(col => col.getIsVisible())

    // Toggle all columns
    table.toggleAllColumnsVisible(!allColumnsVisible)
  }

  const handleResetColumnVisibility = () => {
    // Reset to default visibility (audit columns hidden, others visible)
    const defaultVisibility = {
      createdOn: false,
      createdBy: false,
      updatedOn: false,
      updatedBy: false
    };

    // Set all other columns to visible
    table.getAllLeafColumns().forEach(column => {
      if (!Object.keys(defaultVisibility).includes(column.id)) {
        defaultVisibility[column.id] = true;
      }
    });

    setColumnVisibility(defaultVisibility);
    if (typeof window !== 'undefined') {
      localStorage.setItem('bookingRequestsColumnVisibility', JSON.stringify(defaultVisibility));
    }
  }





  const fetchBookings = async () => {
    try {

      const filtersToPost = {
        dateFrom: filters.dateFrom.length == 0 ? null : filters.dateFrom,
        dateTo: filters.dateTo.length == 0 ? null : filters.dateTo,
        bookingStatus: (Number(filters.userID) == -1 || filters.userID.length == 0) ? null : Number(filters.userID),
        bookingType: filters.bookingType
      }



      const apiBookings = await getMyBookingsWithFiltersApiCall(filtersToPost) as BookingRequestType[];

      const sortedBookings = [...apiBookings].sort((a, b) => {
        return new Date(a.BookingDateTime).getTime() - new Date(b.BookingDateTime).getTime();
      });



      setBookings(sortedBookings);


    } catch (error) {

    }
  };

  React.useEffect(() => {
    fetchBookings()
  }, [filters]);






  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, data) => {
    setAnchorElMenu(event.currentTarget);
    setSelectedBooking(data)
  };

  const handleMenuClose = () => {
    setAnchorElMenu(null);
  };

  const handleView = (event: React.MouseEvent<HTMLElement>, data) => {
    setViewModal(true)
    setSelectedBooking(data)
  };
  const handleEdit = (event: React.MouseEvent<HTMLElement>, data) => {
    setEditModal(true)
    setSelectedBooking(data)
  };




  const loggedInUserID = useSelector((state: RootState) => state.authReducer?.admin?.user?.userID)


  const handleConfirm = async () => {
    try {
      const res = await updateBookingStatusApiCall(selectedBooking?.BookingID, 1, null, loggedInUserID)
      if (res?.isOk) {
        toast.success('Booking confirmed successfully')
        fetchBookings()
        setConfirmModal(false)
        setViewModal(false)
        handleMenuClose()
      }
    }

    catch (err) {

    }

  }


  const handleConfirmWithOther = async () => {


    try {
      const res = await updateBookingStatusApiCall(selectedBooking?.BookingID, 1, selectedCarer, loggedInUserID)
      if (res?.isOk) {
        toast.success('Booking confirmed with the selected carer')
        fetchBookings()
        setViewModal(false)
        setConfirmWithOthersModal(false)
        handleMenuClose()
      }
    }

    catch (err) {

    }


  }


  const handelReject = async () => {

    try {
      const res = await updateBookingStatusApiCall(selectedBooking?.BookingID, 101, null, loggedInUserID, null, cancelAll, true)
      if (res?.isOk) {
        toast.success('Booking cancelled successfully')
        fetchBookings()
        setViewModal(false)
        setRejectModal(false)
        setCancelAll(false)
        handleMenuClose()
      }
    }

    catch (err) {

    }
  }

  const handleEditConfirm = async () => {

    toast.success('Booking edited successfully')
    setViewModal(false)
    setConfirmWithOthersModal(false)
    handleMenuClose()
  }





  const columns = useMemo<ColumnDef<any>[]>(
    () => [
      columnHelper.accessor('BookingDateTime', {
        header: 'Booking Date',
        cell: ({ row, getValue }) => {
          // For grouped rows (parent rows)
          if (row.getIsGrouped()) {
            return (
              <div className="flex items-center font-medium">
                <span
                  onClick={row.getToggleExpandedHandler()}
                  className="pt-1 pe-1 cursor-pointer"
                >
                  {row.getIsExpanded() ? (
                    <i className="ri-arrow-down-s-line" />
                  ) : (
                    <i className="ri-arrow-right-s-line" />
                  )}
                </span>
                <span>{String(row.groupingValue)}</span>
                <span className="ml-2 text-gray-500">
                  ({row.subRows.length} {row.subRows.length === 1 ? 'booking' : 'bookings'})
                </span>
              </div>
            );
          }

          // For regular rows (child rows)
          const date = getValue();
          return (
            <div className="pl-8">
              <Typography className='font-medium'>
                {date ? dayjs(date).format('DD/MM/YYYY') : ''}
              </Typography>
            </div>
          );
        },
        enableGrouping: true,

        getGroupingValue: (row) => {
          if (!row.BookingDateTime) return 'No Date';

          const today = dayjs().startOf('day');
          const date = dayjs(row.BookingDateTime);

          // Current week boundaries
          const startOfWeek = today.startOf('week');
          const endOfWeek = today.endOf('week');

          // Next week boundaries
          const startOfNextWeek = today.add(1, 'week').startOf('week');
          const endOfNextWeek = today.add(1, 'week').endOf('week');

          // Adjusted boundaries for Earlier/Later
          const earlierCutoff = today.subtract(1, 'week').startOf('week');
          const laterCutoff = today.add(1, 'week').endOf('week');

          if (date.isBefore(earlierCutoff, 'day')) {
            return 'Earlier'; // Before previous week's Sunday (June 1 in your example)
          } else if (date.isBetween(earlierCutoff, startOfWeek, null, '[)')) {
            return 'Last Week'; // Previous week's Sunday through Saturday
          } else if (date.isBetween(startOfWeek, endOfWeek, null, '[]')) {
            return 'This Week';
          } else if (date.isBetween(startOfNextWeek, endOfNextWeek, null, '[]')) {
            return 'Next Week';
          } else if (date.isAfter(laterCutoff, 'day')) {
            return 'Later'; // After next week's Monday (June 23 in your example)
          }
        }
      }),

      columnHelper.accessor('ServiceName', {
        header: 'Service Name',
        cell: ({ row }) => {
          if (row.getIsGrouped()) return null;
          return (
            <Typography className='font-medium'>
              {row.original.ServiceName || ''}
            </Typography>
          );
        },
      }),

      columnHelper.accessor('Duration', {
        header: 'Duration',
        cell: ({ row }) => {
          if (row.getIsGrouped()) return null;
          return (
            <Typography className='font-medium'>
              {row.original.Duration || 0} Hours
            </Typography>
          );
        },
      }),

      columnHelper.accessor('ClientName', {
        header: 'Client Name',
        cell: ({ row }) => {
          if (row.getIsGrouped()) return null;
          return (
            <Typography className='font-medium'>
              {row.original.ClientName || ''}
            </Typography>
          );
        },
      }),

      columnHelper.accessor('CarerName', {
        header: 'Carer Name',
        cell: ({ row }) => {
          if (row.getIsGrouped()) return null;
          return (
            <Typography className='font-medium'>
              {row.original.CarerName || ''}
            </Typography>
          );
        },
      }),

      columnHelper.accessor('BookingStatus', {
        header: 'Booking Status',
        cell: ({ row }) => {
          if (row.getIsGrouped()) return null;
          if (row.original.BookingStatus == 0) {
            return (
              <Tooltip title="Update Status">
                <Chip
                  color="warning"
                  label="Pending"
                  variant="outlined"
                  onClick={(e) => handleMenuOpen(e, row.original)}
                />
              </Tooltip>
            );
          }
          else if (row.original.BookingStatus == 1) {
            return (
              <Tooltip title="Update Status">
                <Chip
                  color="success"
                  label="Confirmed"
                  variant="outlined"
                  onClick={(e) => handleMenuOpen(e, row.original)}
                />
              </Tooltip>
            );
          }
          else {
            return (
              <Tooltip title="Update Status">
                <Chip
                  color="error"
                  label="Cancelled"
                  variant="outlined"
                  onClick={(e) => handleMenuOpen(e, row.original)}
                />
              </Tooltip>
            );
          }
        },
      }),



      columnHelper.accessor('BookingType', {
        header: 'Booking Type',
        cell: ({ row }) => {
          if (row.getIsGrouped()) return null;
          return (
            <Typography className='font-medium'>
              {row.original.RecurringBookingID ?
                <Chip className=' text-[#28a745] border-[#28a745]' label="Recurring" variant="outlined" ></Chip>
                :
                <Chip className=' text-gray-500 border-gray-500' label="Regular" variant="outlined" ></Chip>}
            </Typography>
          );
        },
      }),


      columnHelper.accessor('Descr', {
        header: 'Description',
        cell: ({ row }) => {
          if (row.getIsGrouped()) return null;
          return (
            <Typography className="font-medium whitespace-pre-wrap break-words" style={{
              minWidth: '200px',
              maxWidth: '100%',
              wordBreak: 'break-word'
            }}>
              {row.original.Descr.split(" ").slice(0, 7).join(" ") + `${row.original.Descr.split(" ").length > 7 ? '...' : ''}`}
            </Typography>
          );
        },
      }),

      columnHelper.accessor('CreatedOn', {
        header: 'Created On',
        cell: ({ row }) => {
          if (row.getIsGrouped()) return null;
          return (
            <Typography className='font-medium'>
              {row.original.CreatedOn && GetFormattedDateTimeUTCString(row.original.CreatedOn)}
            </Typography>
          );
        },
      }),

      columnHelper.accessor('CreatedByUserName', {
        header: 'Created By',
        cell: ({ row }) => {
          if (row.getIsGrouped()) return null;
          return (
            <Typography className='font-medium'>
              {row.original.CreatedByUserName || ""}
            </Typography>
          );
        },
      }),

      columnHelper.accessor('UpdatedOn', {
        header: 'Updated On',
        cell: ({ row }) => {
          if (row.getIsGrouped()) return null;
          return (
            <Typography className='font-medium'>
              {row.original.UpdatedOn && GetFormattedDateTimeUTCString(row.original.UpdatedOn)}
            </Typography>
          );
        },
      }),

      columnHelper.accessor('UpdatedByUserName', {
        header: 'Updated By',
        cell: ({ row }) => {
          if (row.getIsGrouped()) return null;
          return (
            <Typography className='font-medium'>
              {row.original.UpdatedByUserName || ""}
            </Typography>
          );
        },
      }),

      columnHelper.accessor('action', {
        header: 'Action',
        cell: ({ row }) => {
          if (row.getIsGrouped()) return null;
          return (
            <div className='flex items-center gap-0.5'>
              <IconButton
                size='small'
                onClick={(event) => handleView(event, row.original)}
              >
                <i className='ri-eye-line text-textSecondary' />
              </IconButton>

              <IconButton
                disabled={row.original.BookingStatus !== 0}
                size='small'
                onClick={(event) => handleEdit(event, row.original)}
              >
                <i className='ri-edit-box-line text-textSecondary' />
              </IconButton>
            </div>
          );
        },
        enableSorting: false,
        enableGrouping: false,
      })
    ],
    []
  );


  const [grouping, setGrouping] = useState(['BookingDateTime'])


  const table = useReactTable({
    data: data as BookingRequestType[],
    columns,
    filterFns: {
      fuzzy: fuzzyFilter
    },
    state: {
      grouping,
      rowSelection,
      globalFilter,
      columnVisibility,

    },
    initialState: {
      pagination: {
        pageSize: 10
      },

      expanded: true
    },
    enableRowSelection: true,
    globalFilterFn: fuzzyFilter,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues(),


    getExpandedRowModel: getExpandedRowModel(),
    getGroupedRowModel: getGroupedRowModel(),
    debugTable: true,

  })

  const onFilterChange = (dateFrom: string | undefined, dateTo: string | undefined, userID: string | undefined, bookingType: number | null) => {

    setFilters({
      ...filters,
      dateFrom: dateFrom!,
      dateTo: dateTo!,
      userID: userID!,
      bookingType: bookingType
    });
  }

  const handleModalOpen = (type) => {

    if (type == 'confirm') {
      setConfirmModal(true)
    }
    else if (type == 'confirmwithother') {
      setConfirmWithOthersModal(true)
    }
    else if (type == 'reject') {
      setRejectModal(true)
    }

  }

  return (
    <>
      <Card>

        {viewMode == 'list' || showFilters ?
          <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-4 my-3'>

            {/* Table Filters - will take full width on small screens */}
            <div className='w-full sm:w-auto'>
              <TableFilters onFilterChange={onFilterChange} />
            </div>

            {/* Button Group - will wrap below filters on small screens */}
            <div className='flex justify-start items-center gap-2 sm:px-2 px-4 pb-2 sm:pb-0 '>

              <>

                <Grid>
                  <Button
                    variant="contained"
                    onClick={() => setAddBooking(!addBooking)}
                    className="h-[40px]"
                  >
                    Add Booking
                  </Button>
                </Grid>


                <Tooltip title="Show/Hide Columns">
                  <Button
                    variant="outlined"
                    onClick={handleColumnMenuClick}
                    startIcon={<i className="ri-table-line" />}
                    endIcon={<i className={anchorEl ? "ri-arrow-up-s-line" : "ri-arrow-down-s-line"} />}
                    size="small"
                    className='h-[40px]'
                  >
                    Columns
                  </Button>
                </Tooltip>

                <ToggleButtonGroup
                  value={viewMode}
                  exclusive
                  onChange={handleViewModeChange}
                  aria-label="view mode"
                  size="small"
                  className='h-[40px]'
                >
                  <ToggleButton value="card" aria-label="card view">
                    <i className="ri-calendar-line" />
                  </ToggleButton>
                  <ToggleButton value="list" aria-label="list view">
                    <i className="ri-list-check" />
                  </ToggleButton>
                </ToggleButtonGroup>
              </>

            </div>

            {/* Column Visibility Menu */}
            <Menu
              id="column-visibility-menu"
              anchorEl={anchorEl}
              open={open}
              onClose={handleColumnMenuClose}
              PaperProps={{
                style: { maxHeight: 300, width: '240px' }
              }}
            >
              <div className="flex items-center justify-between px-3 py-2">
                <Typography variant="subtitle2">
                  Show/Hide Columns
                </Typography>
                <Tooltip title="Reset to Default">
                  <IconButton
                    size="small"
                    onClick={handleResetColumnVisibility}
                    aria-label="Reset column visibility"
                  >
                    <i className="ri-refresh-line" />
                  </IconButton>
                </Tooltip>
              </div>
              <Divider />
              <FormGroup sx={{ px: 3, py: 1 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={table.getAllLeafColumns().every(col => col.getIsVisible())}
                      indeterminate={
                        table.getAllLeafColumns().some(col => col.getIsVisible()) &&
                        !table.getAllLeafColumns().every(col => col.getIsVisible())
                      }
                      onChange={handleToggleAllColumns}
                      size="small"
                    />
                  }
                  label={<Typography variant="body2" sx={{ fontWeight: 'bold' }}>Select All</Typography>}
                />
                <Divider sx={{ my: 1 }} />
                {table.getAllLeafColumns().map(column => (
                  <FormControlLabel
                    key={column.id}
                    control={
                      <Checkbox
                        checked={column.getIsVisible()}
                        onChange={column.getToggleVisibilityHandler()}
                        size="small"
                      />
                    }
                    label={<Typography variant="body2">{column.columnDef.header?.toString() ?? column.id}</Typography>}
                    sx={{
                      py: 0.5,
                      '.MuiFormControlLabel-label': {
                        fontSize: '0.875rem'
                      }
                    }}
                  />
                ))}
              </FormGroup>
            </Menu>
          </div>
          :
          <></>
        }



        <Divider />


        <AnimatePresence mode="wait">
          {viewMode === 'list' ? (
            <motion.div
              key="list-view"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >

              <div className='overflow-x-auto'>
                <table className={tableStyles.table}>
                  <thead>
                    {loading ? (
                      <tr>
                        {table.getVisibleFlatColumns().map((_, index) => (
                          <th key={`skeleton-head-${index}`}>
                            <div className="w-24 h-[16px] bg-gray-300 rounded animate-wave" />
                          </th>
                        ))}
                      </tr>
                    ) : (
                      table.getHeaderGroups().map(headerGroup => (
                        <tr key={headerGroup.id}>
                          {headerGroup.headers.map(header => (
                            <th key={header.id}>
                              {header.isPlaceholder ? null : (
                                <div className="flex items-center">
                                  <div
                                    className={classnames({
                                      'flex items-center': header.column.getIsSorted(),
                                      'cursor-pointer select-none': header.column.getCanSort()
                                    })}
                                    onClick={header.column.getToggleSortingHandler()}
                                  >
                                    {flexRender(header.column.columnDef.header, header.getContext())}
                                    {{
                                      asc: <i className='ri-arrow-up-s-line text-xl' />,
                                      desc: <i className='ri-arrow-down-s-line text-xl' />
                                    }[header.column.getIsSorted() as 'asc' | 'desc'] ?? null}
                                  </div>
                                </div>
                              )}
                            </th>
                          ))}
                        </tr>
                      ))
                    )}
                  </thead>

                  <tbody>
                    {loading ? (
                      Array.from({ length: 10 }).map((_, rowIndex) => (
                        <tr key={`skeleton-row-${rowIndex}`}>
                          {table.getVisibleFlatColumns().map((_, colIndex) => (
                            <td key={`skeleton-cell-${rowIndex}-${colIndex}`}>
                              <div className="h-[20px] bg-gray-300 rounded animate-wave mx-2" />
                            </td>
                          ))}
                        </tr>
                      ))
                    ) : table.getFilteredRowModel().rows.length === 0 ? (
                      <tr>
                        <td colSpan={table.getVisibleFlatColumns().length} className='text-center py-4'>
                          No data available
                        </td>
                      </tr>
                    ) : (
                      table.getRowModel().rows.map(row => {
                        return (
                          <tr
                            key={row.id}
                            className={classnames({
                              selected: row.getIsSelected(),
                              'bg-gray-50': row.getIsGrouped(),
                            })}
                          >
                            {row.getVisibleCells().map(cell => {
                              return (
                                <td key={cell.id}>
                                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                </td>
                              )
                            })}
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>




              <TablePagination
                rowsPerPageOptions={[10, 25, 50]}
                component='div'
                className='border-bs'
                count={table.getFilteredRowModel().rows.length}
                rowsPerPage={table.getState().pagination.pageSize}
                page={table.getState().pagination.pageIndex}
                SelectProps={{
                  inputProps: { 'aria-label': 'rows per page' }
                }}
                onPageChange={(_, page) => {
                  table.setPageIndex(page)
                }}
                onRowsPerPageChange={e => table.setPageSize(Number(e.target.value))}
              />
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <BookingRequestCalendar
                handleViewModeChange={handleViewModeChange}
                viewMode={viewMode}
                data={data}
              />
            </motion.div>
          )}
        </AnimatePresence>







      </Card>





      <ConfirmBooking
        open={confirmModal}
        handleClose={() => {
          setConfirmModal(false)
          handleMenuClose()
        }}
        onConfirm={handleConfirm}
      />
      <RejectBooking
        open={rejectModal}
        handleClose={() => {
          setRejectModal(false)
          handleMenuClose()
        }}
        onConfirm={handelReject}

        recurringBookingID={selectedBooking?.RecurringBookingID}
        setCancelAll={setCancelAll}
        cancelAll={cancelAll}
      />
      <ConfirmWithOther
        setSelectedCarer={setSelectedCarer}
        selectedCarer={selectedCarer}
        data={selectedBooking}
        open={confirmWithOthersModal}
        handleClose={() => {
          setConfirmWithOthersModal(false)
          handleMenuClose()
        }}
        onConfirm={handleConfirmWithOther}
      />


      <EditBookingDialog
        title=''
        open={editModal}
        handleClose={() => {
          setEditModal(false)
        }}
        onConfirm={handleEditConfirm}
        bookingData={selectedBooking}
        fetchBooking={fetchBookings}
      />

      <ViewBooking
        open={viewModal}
        handleClose={() => {
          setViewModal(false)
        }}
        bookingData={selectedBooking}


        setActionByViewMode={setActionByViewMode}

        setConfirmModalOpen={setConfirmModal}
        setConfirmWithOtherCarerModalOpen={setConfirmWithOthersModal}
        setCancelModalOpen={setRejectModal}
        setEditModalOpen={setEditModal}


      />

      <Menu
        anchorEl={anchorElMenu}
        open={Boolean(anchorElMenu)}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{
          sx: {
            minWidth: '200px',
            boxShadow: '0px 4px 15px rgba(0, 0, 0, 0.1)',
          }
        }}
      >
        {/* Confirm - only shown if status is 0 or 101 */}
        {[0, 101].includes(selectedBooking?.BookingStatus) && (
          <MenuItem onClick={() => handleModalOpen('confirm')}>
            <ListItemIcon>
              <i className="ri-check-line text-green-600" />
            </ListItemIcon>
            <ListItemText>Confirm Booking</ListItemText>
          </MenuItem>
        )}

        {/* Confirm with other carer - always shown */}
        <MenuItem onClick={() => handleModalOpen('confirmwithother')}>
          <ListItemIcon>
            <i className="ri-user-follow-line text-blue-600" />
          </ListItemIcon>
          <ListItemText>Confirm With Other Carer</ListItemText>
        </MenuItem>

        {/* Cancel - hidden if status is 101 */}
        {selectedBooking?.BookingStatus != 101 && (
          <MenuItem onClick={() => handleModalOpen('reject')}>
            <ListItemIcon>
              <i className="ri-close-line text-red-600" />
            </ListItemIcon>
            <ListItemText>Cancel Booking</ListItemText>
          </MenuItem>
        )}
      </Menu>


      <AddNewBooking
        open={addBooking}
        handleClose={() => setAddBooking(!addBooking)}
        onConfirm={handleEditConfirm}
        fetchBooking={() => fetchBookings()}
      />


    </>
  )
}

export default BookingRequestsListTable
