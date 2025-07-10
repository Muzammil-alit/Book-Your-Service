'use client'

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
  getExpandedRowModel,
} from '@tanstack/react-table'
import type { ColumnDef, FilterFn } from '@tanstack/react-table'
import type { RankingInfo } from '@tanstack/match-sorter-utils'

// Style Imports
import tableStyles from '@core/styles/table.module.css'
import { Chip, Divider, Tooltip, Button, FormGroup, FormControlLabel, Checkbox, Skeleton, } from '@mui/material'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import ToggleButton from '@mui/material/ToggleButton'
import TableFilters from './TableFilters'
import dayjs from 'dayjs'

import Menu from '@mui/material/Menu'

import { getAdminRosterApiCall } from './action'
import { toast } from 'react-toastify'
import EditBookingDialog from './EditBooking'

import { useEffect } from 'react'

import { motion, AnimatePresence } from 'framer-motion'

import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { BookingRequestType } from '@/types/apps/bookingRequestsType'
import { getCarerListApiCall } from '@/views/admin/services/action'

import { useDispatch } from 'react-redux'
import { useAppSelector } from '@/redux/useAppSelector'
import { GetFormattedDateTimeUTCString } from '@/utils/commonFunction'



interface Filters {
  userID: string;
  dateFrom: string;
  dateTo: string;
}


interface BookingRequestsListTableProps {
  tableData: BookingRequestType[];
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
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

const RosterListTable = ({ filters, setFilters }) => {
  // States
  const [rowSelection, setRowSelection] = useState({})
  const [data, setData] = useState<BookingRequestType[]>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [selectedBooking, setSelectedBooking] = useState([])
  const [anchorElMenu, setAnchorElMenu] = useState<null | HTMLElement>(null);
  const [expanded, setExpanded] = useState<any>(true); // For all groups expanded by default

  dayjs.extend(utc);
  dayjs.extend(timezone);

  const [confirmModal, setConfirmModal] = useState(false);
  const [confirmWithOthersModal, setConfirmWithOthersModal] = useState(false);
  const [rejectModal, setRejectModal] = useState(false);
  const [editModal, setEditModal] = useState(false)
  const [selectedCarer, setSelectedCarer] = useState('0'); // Default to "All" carer
  const [bookings, setBookings] = useState<BookingRequestType[]>([]);
  const [loading, setLoading] = useState(false)

  // View modes
  const [viewModal, setViewModal] = useState(false)
  const [viewMode, setViewMode] = useState<'list' | 'card'>(() => {
    const savedViewMode = localStorage.getItem('bookingViewMode');
    return savedViewMode === 'card' ? 'card' : 'list';
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('carerViewMode', viewMode);
    }
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
    const defaultVisibility = {
      CreatedOn: false,
      CreatedByUserName: false,
      UpdatedOn: false,
      UpdatedByUserName: false
    };

    if (typeof window !== 'undefined') {
      const savedVisibility = localStorage.getItem('bookingRequestsColumnVisibility')
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

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('bookingsRequests', JSON.stringify(columnVisibility));
    }
  }, [columnVisibility]);

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
    table.toggleAllColumnsVisible(!allColumnsVisible)
  }

  const handleResetColumnVisibility = () => {
    const defaultVisibility = {
      CreatedOn: false,
      CreatedBy: false,
      UpdatedOn: false,
      UpdatedByUserName: false
    };

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

  const dispatch = useDispatch();
  const carerID = useAppSelector((state) => state.authReducer.carer.user?.carerID);


  const [isFirstLoad, setIsFirstLoad] = useState(true);

  const fetchBookings = async () => {
    try {

      if (isFirstLoad) {
        setLoading(true);
      }

      const filtersToPost = {
        dateFrom: filters.dateFrom && filters.dateFrom.length ? filters.dateFrom : null,
        dateTo: filters.dateTo && filters.dateTo ? filters.dateTo : null,
        carerID: carerID,
      }

      const apiBookings = await getAdminRosterApiCall(filtersToPost);
      const sortedBookings = [...apiBookings as any].sort((a, b) => {
        return (new Date(a.BookingDateTime) as any) - (new Date(b.BookingDateTime) as any);
      });
      setBookings(sortedBookings);

      if (isFirstLoad) {
        setIsFirstLoad(false);
      }

    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
    finally {
      setLoading(false)
    }
  };

  React.useEffect(() => {
    fetchBookings()
  }, [filters, viewMode]);

  useEffect(() => {
    const fetchCarers = async () => {
      try {
        await getCarerListApiCall(dispatch);
      } catch (error) {
        console.error('Failed to fetch carers:', error);
      }
    };
    fetchCarers();
  }, []);

  const handleMenuClose = () => {
    setAnchorElMenu(null);
  };

  const handleEdit = (event: React.MouseEvent<HTMLElement>, data) => {
    setEditModal(true)
    setSelectedBooking(data)
  };

  const handleEditConfirm = async () => {
    toast.success('Booking edited successfully')
    setConfirmWithOthersModal(false)
    handleMenuClose()
  }

  const [grouping, setGrouping] = useState(['BookingDateTime'])

  const columns = useMemo<ColumnDef<any, any>[]>(
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
                <span>{row.groupingValue as any}</span>
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

      columnHelper.accessor('StartTime', {
        header: 'Start Time',
        cell: ({ row }) => {
          if (row.getIsGrouped()) return null;
          return (
            <Typography className='font-medium'>
              {row.original.ActualStartDateTime ?
                dayjs(row.original.ActualStartDateTime).format('hh:mm A') :
                ''
              }
            </Typography>
          );
        },
      }),

      columnHelper.accessor('EndTime', {
        header: 'End Time',
        cell: ({ row }) => {
          if (row.getIsGrouped()) return null;
          return (
            <Typography className='font-medium'>
              {row.original.ActualEndDateTime ?
                dayjs(row.original.ActualEndDateTime).format('hh:mm A') :
                ''
              }
            </Typography>
          );
        },
      }),


      columnHelper.accessor('CompletionStatus', {
        header: 'Completion Status',
        cell: ({ row }) => {
          if (row.getIsGrouped()) return null;
          if (row.original.CompletionStatus == 1) {
            return <Chip color="success" label="Full Shift Completed" variant="outlined" onClick={(event) => {
              handleEdit(event, row.original)
            }} ></Chip>
          }
          else if (row.original.CompletionStatus == 2) {
            return <Chip color="info" label="Adjusted Shift Completed" variant="outlined" onClick={(event) => {
              handleEdit(event, row.original)
            }}></Chip>
          }
          else if (row.original.CompletionStatus == 101) {
            return <Chip color="error" label="Shift Cancelled" variant="outlined" onClick={(event) => {
              handleEdit(event, row.original)
            }}></Chip>
          }
          else {
            return <Chip color="warning" label="Pending" variant="outlined" onClick={(event) => {
              handleEdit(event, row.original)
            }}></Chip>
          }
        },
      }),

      columnHelper.accessor('CarerNotes', {
        header: 'Carer Notes',
        cell: ({ row }) => {
          if (row.getIsGrouped()) return null;
          return (
            <Typography className="font-medium whitespace-pre-wrap break-words" style={{
              minWidth: '200px',
              maxWidth: '100%',
              wordBreak: 'break-word'
            }}>
              {row.original.CarerNotes ? row.original.CarerNotes.split(" ").slice(0, 7).join(" ") : ""}
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

    ],
    []
  );
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
      expanded
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
    onExpandedChange: setExpanded,
    debugTable: true,
  })

  const onFilterChange = (dateFrom: string | undefined, dateTo: string | undefined, userID: string | undefined) => {
    setFilters({
      ...filters,
      dateFrom: dateFrom!,
      dateTo: dateTo!,
      userID: userID!,
    });
  }

  return (
    <>
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-4 ">
          {/* Filters */}
          <div className="w-full sm:w-auto">
            <TableFilters onFilterChange={onFilterChange}  />
          </div>

          {/* Column Toggle Button */}
          <div className="w-full sm:w-auto flex justify-start sm:justify-end px-4 ">
            <>
              <Tooltip title="Show/Hide Columns">
                <Button
                  variant="outlined"
                  onClick={handleColumnMenuClick}
                  startIcon={<i className="ri-table-line" />}
                  endIcon={
                    <i className={anchorEl ? "ri-arrow-up-s-line" : "ri-arrow-down-s-line"} />
                  }
                  size="small"
                  className='h-[40px]'
                >
                  Columns
                </Button>
              </Tooltip>
            </>
          </div>

          {/* Column Visibility Menu */}
          <Menu
            id="column-visibility-menu"
            anchorEl={anchorEl}
            open={open}
            onClose={handleColumnMenuClose}
            PaperProps={{ style: { maxHeight: 300, width: '240px' } }}
          >
            <div className="flex items-center justify-between px-3 py-2">
              <Typography variant="subtitle2">Show/Hide Columns</Typography>
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
                label={
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    Select All
                  </Typography>
                }
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
                  label={
                    <Typography variant="body2">
                      {column.columnDef.header?.toString() ?? column.id}
                    </Typography>
                  }
                  sx={{
                    py: 0.5,
                    '.MuiFormControlLabel-label': {
                      fontSize: '0.875rem',
                    },
                  }}
                />
              ))}
            </FormGroup>
          </Menu>
        </div>

        <Divider />

        <AnimatePresence mode="wait">
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
                              <>
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
                              </>
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
                            <div className="w-full">
                              <div className="h-[20px] bg-gray-300 rounded animate-wave" />
                            </div>
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : table.getFilteredRowModel().rows.length === 0 ? (
                    <tr>
                      <td colSpan={table.getVisibleFlatColumns().length} className='text-center'>
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
        </AnimatePresence>
      </Card>

      {selectedCarer && (
        <EditBookingDialog
          open={editModal}
          handleClose={() => setEditModal(false)}
          onConfirm={handleEditConfirm}
          bookingData={selectedBooking}
          fetchData={fetchBookings}
        />
      )}
    </>
  )
}

export default RosterListTable
