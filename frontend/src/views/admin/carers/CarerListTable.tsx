'use client'

// React Imports
import React, { useEffect, useState, useMemo } from 'react'

// Next Imports
import { useRouter } from 'next/navigation'

// MUI Imports
import Card from '@mui/material/Card'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import TablePagination from '@mui/material/TablePagination'
import type { TextFieldProps } from '@mui/material/TextField'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import FormGroup from '@mui/material/FormGroup'
import FormControlLabel from '@mui/material/FormControlLabel'
import Checkbox from '@mui/material/Checkbox'
import Divider from '@mui/material/Divider'
import Avatar from '@mui/material/Avatar'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import ToggleButton from '@mui/material/ToggleButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import { CardContent, CardHeader, Tooltip, CircularProgress, Skeleton } from '@mui/material'
import InputAdornment from '@mui/material/InputAdornment'

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
  getSortedRowModel
} from '@tanstack/react-table'
import type { ColumnDef, FilterFn } from '@tanstack/react-table'
import type { RankingInfo } from '@tanstack/match-sorter-utils'
import { motion, AnimatePresence } from 'framer-motion'
import { useDispatch } from 'react-redux'
import { toast } from 'react-toastify'

// Type Imports
import type { ThemeColor } from '@core/types'

// Component Imports
import TableFilters from './TableFilters'
import AddCarerDrawer from './AddCarerDrawer'
import CarerListCards from './CarerListCards'
import WeeklyOffModal from './WeeklyOffModal'

// Style Imports
import tableStyles from '@core/styles/table.module.css'
import { deleteCarerApiCall, getAllCarersApiCall, getCarerByIdApiCall } from './action'
import ConfirmDelete from './ConfimDelete'
import EditCarer from './EditCarer'
import { Box, Grid } from '@mui/material'
import { CarerType } from '@/types/apps/carerTypes'
import AssignServiceList from './AssignServiceList'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc';
import { GetFormattedDateTimeUTCString } from '@/utils/commonFunction'

declare module '@tanstack/table-core' {
  interface FilterFns {
    fuzzy: FilterFn<unknown>
  }
  interface FilterMeta {
    itemRank: RankingInfo
  }
}

export interface CarerTypeWithAction {
  CarerID: number;
  CarerName: string;
  Descr: string;
  Color: string;
  CreatedOn: string;
  CreatedBy?: number | null;
  CreatedByUserName?: string;
  UpdatedOn: string;
  UpdatedBy?: number | null;
  UpdatedByUserName?: string;
  Active: boolean;
  ProfilePic?: {
    type: string;
    data: number[];
  };
  action?: string;
}

type CarerStatusType = {
  [key: string]: ThemeColor
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

const DebouncedInput = ({
  value: initialValue,
  onChange,
  debounce = 500,
  ...props
}: {
  value: string | number
  onChange: (value: string | number) => void
  debounce?: number
} & Omit<TextFieldProps, 'onChange'>) => {
  // States
  const [value, setValue] = useState(initialValue)

  useEffect(() => {
    setValue(initialValue)
  }, [initialValue])

  useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(value)
    }, debounce)

    return () => clearTimeout(timeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  const handleClear = () => {
    setValue('')
    onChange('')
  }

  return (
    <TextField
      {...props}
      value={value}
      onChange={e => setValue(e.target.value)}
      size='small'
      InputProps={{
        endAdornment: value ? (
          <InputAdornment position="end">
            <IconButton
              aria-label="clear search"
              onClick={handleClear}
              edge="end"
              size="small"
            >
              <i className="ri-close-line" />
            </IconButton>
          </InputAdornment>
        ) : null
      }}
    />
  )
}

const carerStatusObj: CarerStatusType = {
  active: 'success',
  inactive: 'error'
}

// Column Definitions
const columnHelper = createColumnHelper<CarerTypeWithAction>()

const CarerListTable = ({ tableData, loading }: { tableData?: CarerType[]; loading?: boolean }) => {
  // Add router
  const router = useRouter()

  dayjs.extend(utc);

  // States
  const [addCarerOpen, setAddCarerOpen] = useState(false)
  const [deleteCarerOpen, setDeleteCarerOpen] = useState(false);
  const [editCarerOpen, setEditCarerOpen] = useState(false);
  const [assignCarerOpen, setAssignCarerOpen] = useState(false);
  const [rowSelection, setRowSelection] = useState({})
  const [data, setData] = useState<CarerType[]>([]);
  const [filteredData, setFilteredData] = useState(data)
  const [globalFilter, setGlobalFilter] = useState('');
  const [selectedCarerID, setSelectedCarerID] = useState<number>();
  const [selectedCarerData, setSelectedCarerData] = useState<CarerType>();
  const [viewMode, setViewMode] = useState<'list' | 'card'>(() => {
    const savedViewMode = localStorage.getItem('carerViewMode');
    return savedViewMode === 'card' ? 'card' : 'list';
  });
  const [anchorElMenu, setAnchorElMenu] = useState<null | HTMLElement>(null);
  const [selectedCarerForMenu, setSelectedCarerForMenu] = useState<CarerType | null>(null);
  const [weeklyOffModalOpen, setWeeklyOffModalOpen] = useState(false);
  const [loadingState, setLoadingState] = useState<boolean>(false);

  // Save view mode to localStorage when it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('carerViewMode', viewMode);
    }
  }, [viewMode]);

  // Column visibility state
  const [columnVisibility, setColumnVisibility] = useState(() => {
    const defaultVisibility = {
      CreatedOn: false,
      CreatedByUserName: false,
      UpdatedOn: false,
      UpdatedByUserName: false
    };

    if (typeof window !== 'undefined') {
      const savedVisibility = localStorage.getItem('carerTableColumnVisibility')
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
      localStorage.setItem('carerTableColumnVisibility', JSON.stringify(columnVisibility));
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
    table.toggleAllColumnsVisible(!allColumnsVisible)
  }

  const handleResetColumnVisibility = () => {
    const defaultVisibility = {
      CreatedOn: false,
      CreatedByUserName: false,
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
      localStorage.setItem('carerTableColumnVisibility', JSON.stringify(defaultVisibility));
    }
  }

  React.useEffect(() => {
    if (tableData && tableData?.length > 0) {
      setData(tableData);
    } else {
      setData([]);
    }
  }, [tableData]);

  // Update filteredData when globalFilter changes
  useEffect(() => {
    if (globalFilter === '') {
      setFilteredData(data);
    } else {
      const filtered = data.filter(carer => {
        const matchPattern = new RegExp(globalFilter.toLowerCase(), 'i');

        console.log(carer)


        return (
          matchPattern.test(carer.CarerName.toLowerCase()) ||
          (carer.Descr && matchPattern.test(carer.Descr.toLowerCase())) ||
          (carer.Email && matchPattern.test(carer.Email.toLowerCase())) ||
          (carer.CreatedByUserName && matchPattern.test(carer.CreatedByUserName.toLowerCase())) ||
          (carer.UpdatedByUserName && matchPattern.test(carer.UpdatedByUserName.toLowerCase()))
        );
      });
      setFilteredData(filtered);
    }
  }, [globalFilter]);

  const handleDeleteCarer = async (CarerID: number) => {
    setSelectedCarerID(CarerID);
    setDeleteCarerOpen(true);
  }

  const handleAssignCarer = (CarerID: number, CarerName: string) => {
    setSelectedCarerID(CarerID);
    setSelectedCarerData(data.find(carer => carer.CarerID === CarerID));
    setAssignCarerOpen(true);
  }

  const deleteCarer = async () => {
    await deleteCarerApiCall(selectedCarerID!, () => {
      setData(data?.filter(product => product.CarerID !== selectedCarerID));
    })
    setDeleteCarerOpen(false);
  }

  const handleEditCarer = async (carerData: any) => {
    try {
      setLoadingState(true);
      const latestCarerData = await getCarerByIdApiCall(carerData.CarerID!);


      if (latestCarerData) {
        setSelectedCarerData(latestCarerData);
        setEditCarerOpen(true);
      }
    } catch (error) {
      toast.error("Failed to fetch carer details");
      console.error("Error fetching carer details:", error);
    } finally {
      setLoadingState(false);
    }
  }

  // Helper function to get initials from carer name
  const getInitials = (name: string) => {
    const names = name?.split(' ');
    if (names?.length === 1) return names[0]?.charAt(0).toUpperCase();
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, carer: any) => {
    setAnchorElMenu(event.currentTarget);
    setSelectedCarerForMenu(carer);
  };

  const handleMenuClose = () => {
    setAnchorElMenu(null);
  };

  const handleConfigureWeeklyOff = () => {
    setWeeklyOffModalOpen(true);
    handleMenuClose();
  };

  const handleManageOffDays = () => {
    if (selectedCarerForMenu?.CarerID) {
      router.push(`/admin/carerOffDays?carerId=${selectedCarerForMenu.CarerID}`);
    }
    handleMenuClose();
  };

  const handleCarerSchedule = () => {
    if (selectedCarerForMenu?.CarerID) {
      router.push(`/admin/calendar?carerId=${selectedCarerForMenu.CarerID}`);
    }
    handleMenuClose();
  };

  const handleRoster = () => {
    if (selectedCarerForMenu?.CarerID) {
      router.push(`/admin/roster?carerId=${selectedCarerForMenu.CarerID}`);
    }
    handleMenuClose();
  };

  const columns = useMemo<ColumnDef<CarerTypeWithAction, any>[]>(
    () => [
      columnHelper.accessor('CarerName', {
        header: 'Carer Name',
        cell: ({ row }) => {

          const buffer = row.original.ProfilePic
          let imageSrc = ''

          if (buffer && buffer.data) {
            const base64String = btoa(
              new Uint8Array(buffer.data).reduce((data, byte) => data + String.fromCharCode(byte), '')
            )
            imageSrc = `data:image/jpeg;base64,${base64String}`
          }

          return (
            <div className='flex items-center gap-3'>
              <Avatar
                src={imageSrc || undefined}
                alt={row.original.CarerName}
                sx={{
                  width: 36,
                  height: 36,
                  bgcolor: row.original.Color || '#1976d2'
                }}
              >
                {getInitials(row.original.CarerName)}
              </Avatar>
              <div className='flex flex-col'>
                <Typography color='text.primary' className='font-medium'>
                  {row.original.CarerName}
                </Typography>
              </div>
            </div>
          )
        }
      }),

      columnHelper.accessor('Descr', {
        header: 'Description',
        cell: ({ row }) => (
          <Typography
            className="font-medium whitespace-pre-wrap break-words"
            style={{
              minWidth: '200px',
              maxWidth: '100%',
              wordBreak: 'break-word'
            }}
          >
            {row.original.Descr}
          </Typography>
        ),
        size: 500, // This sets the initial column width
        minSize: 500, // This ensures it won't shrink below 500px
      }),
      columnHelper.accessor('Color', {
        header: 'Color',
        cell: ({ row }) => (
          <div className='flex items-center'>
            <div
              style={{
                backgroundColor: row.original.Color || '#e0e0e0',
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                display: 'inline-block',
                border: '1px solid #e0e0e0'
              }}
            />
          </div>
        )
      }),
      columnHelper.accessor('CreatedOn', {
        header: 'Created On',
        cell: ({ row }) => <Typography className='font-medium'>
          {row.original.CreatedOn && GetFormattedDateTimeUTCString(row.original.CreatedOn)}
        </Typography>
      }),
      columnHelper.accessor('CreatedByUserName', {
        header: 'Created By',
        cell: ({ row }) => <Typography className='font-medium'>
          {row.original.CreatedByUserName || ""}
        </Typography>
      }),
      columnHelper.accessor('UpdatedOn', {
        header: 'Updated On',
        cell: ({ row }) => <Typography className='font-medium'>
          {row.original.UpdatedOn && GetFormattedDateTimeUTCString(row.original.UpdatedOn)}
        </Typography>
      }),
      columnHelper.accessor('UpdatedByUserName', {
        header: 'Updated By',
        cell: ({ row }) => <Typography className='font-medium'>
          {row.original.UpdatedByUserName || ""}
        </Typography>
      }),
      columnHelper.accessor('Active', {
        header: 'Status',
        cell: ({ row }) => (
          <div className='flex items-center gap-3'>
            <Chip
              variant='tonal'
              label={row.original.Active ? 'Active' : 'Inactive'}
              size='small'
              color={row.original.Active ? carerStatusObj['active'] : carerStatusObj['inactive']}
              className='capitalize'
            />
          </div>
        )
      }),
      columnHelper.accessor('action', {
        header: 'Action',
        cell: ({ row }) => (
          <div className='flex items-center gap-0.5'>
            <IconButton size='small' onClick={() => { handleEditCarer(row.original) }}>
              <i className='ri-edit-box-line text-textSecondary' />
            </IconButton>
            <IconButton size='small' onClick={() => handleDeleteCarer(row.original.CarerID!)}>
              <i className='ri-delete-bin-7-line text-textSecondary' />
            </IconButton>
            <Tooltip title="Assign services to this carer">
              <IconButton size="small" color="primary" onClick={() => handleAssignCarer(row.original.CarerID!, row.original.CarerName)}>
                <i className='ri-user-add-line' />
              </IconButton>
            </Tooltip>
            <Tooltip title="More options">
              <IconButton
                size="small"
                onClick={(e) => handleMenuOpen(e, row.original)}
                aria-label="more options"
              >
                <i className='ri-more-2-fill' />
              </IconButton>
            </Tooltip>
          </div>
        ),
        enableSorting: false
      })
    ],
    [data, filteredData]
  )

  const table = useReactTable({
    data: filteredData as any[],
    columns,
    filterFns: {
      fuzzy: fuzzyFilter
    },
    state: {
      rowSelection,
      columnVisibility
    },
    initialState: {
      pagination: {
        pageSize: 10
      }
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues()
  })

  const handleViewModeChange = (
    event: React.MouseEvent<HTMLElement>,
    newViewMode: 'list' | 'card' | null,
  ) => {
    if (newViewMode !== null) {
      setViewMode(newViewMode);
    }
  };


  return (
    <>
      <Card>


        <Grid
          container
          spacing={2}
          justifyContent="space-between"
          alignItems="flex-end"
          className="px-4 my-3"
          sx={{ flexWrap: 'wrap' }}
        >
          {/* Left Side: Filters + Search */}
          <Grid
            item
            xs={12}
            sm={6}
            container
            spacing={2}
            alignItems="center"
            sx={{ flexWrap: 'wrap' }}
          >
            <Grid item xs={12} sm="auto">
              <TableFilters
                setData={setFilteredData}
                tableData={data}
              />
            </Grid>
            <Grid item xs={12} sm="auto">
              <TextField
                size="small"
                value={globalFilter ?? ''}
                onChange={(e) => setGlobalFilter(e.target.value)}
                placeholder="Search Carer"
                variant="outlined"
                sx={{ width: 200 }}
                className="w-[200px] md:w-[250px] lg:w-[300px]"
              />

            </Grid>
          </Grid>

          {/* Right Side: Actions */}
          <Grid
            item
            xs={12}
            sm={6}
            container
            spacing={2}
            justifyContent={{ xs: 'flex-start', sm: 'flex-end' }}
            alignItems="center"
            sx={{ flexWrap: 'wrap' }}
          >
            {/* Add New Carer Button */}
            <Grid item>
              <Button
                variant="contained"
                onClick={() => setAddCarerOpen(!addCarerOpen)}
                className="h-[40px]"
              >
                Add New Carer
              </Button>
            </Grid>

            {/* View Mode Toggle */}
            <Grid item>
              <ToggleButtonGroup
                value={viewMode}
                exclusive
                onChange={handleViewModeChange}
                aria-label="view mode"
                size="small"
              >
                <ToggleButton value="card" aria-label="card view">
                  <i className="ri-layout-grid-fill" />
                </ToggleButton>
                <ToggleButton value="list" aria-label="list view">
                  <i className="ri-list-check" />
                </ToggleButton>
              </ToggleButtonGroup>
            </Grid>

            {/* Columns Menu Button */}
            {viewMode == 'list' &&
              <Grid item>
                <>
                  <Tooltip title="Show/Hide Columns">
                    <Button
                      className="h-[40px]"
                      variant="outlined"
                      onClick={handleColumnMenuClick}
                      startIcon={<i className="ri-table-line" />}
                      endIcon={
                        <i
                          className={
                            anchorEl
                              ? 'ri-arrow-up-s-line'
                              : 'ri-arrow-down-s-line'
                          }
                        />
                      }
                      size="small"
                    >
                      Columns
                    </Button>
                  </Tooltip>

                  {/* Columns Menu */}
                  <Menu
                    id="column-visibility-menu"
                    anchorEl={anchorEl}
                    open={open}
                    onClose={handleColumnMenuClose}
                    PaperProps={{
                      style: { maxHeight: 300, width: '240px' },
                    }}
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
                            checked={table
                              .getAllLeafColumns()
                              .every((col) => col.getIsVisible())}
                            indeterminate={
                              table
                                .getAllLeafColumns()
                                .some((col) => col.getIsVisible()) &&
                              !table
                                .getAllLeafColumns()
                                .every((col) => col.getIsVisible())
                            }
                            onChange={handleToggleAllColumns}
                            size="small"
                          />
                        }
                        label={
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: 'bold' }}
                          >
                            Select All
                          </Typography>
                        }
                      />
                      <Divider sx={{ my: 1 }} />
                      {table.getAllLeafColumns().map((column) => (
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
                </>
              </Grid>
            }
          </Grid>
        </Grid>


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
                          {table.getVisibleFlatColumns().map((col, colIndex) => (
                            <td key={`skeleton-cell-${rowIndex}-${colIndex}`}>
                              <div className="w-full">
                                <div className="h-[20px] bg-gray-300 rounded animate-wave" />
                              </div>
                            </td>
                          ))}
                        </tr>
                      ))
                    ) : filteredData.length === 0 ? (
                      <tr>
                        <td colSpan={table.getVisibleFlatColumns().length} className='text-center'>
                          No data available
                        </td>
                      </tr>
                    ) : (
                      table
                        .getRowModel()
                        .rows.slice(0, table.getState().pagination.pageSize)
                        .map(row => (
                          <tr key={row.id} className={classnames({ selected: row.getIsSelected() })}>
                            {row.getVisibleCells().map(cell => (
                              <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                            ))}
                          </tr>
                        ))
                    )}
                  </tbody>
                </table>
              </div>



              <TablePagination
                rowsPerPageOptions={[5, 10, 25, 50]}
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
              key="card-view"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="p-5"
            >
              <CarerListCards
                loading={loading}
                data={filteredData}
                handleEditCarer={handleEditCarer}
                handleDeleteCarer={handleDeleteCarer}
                handleAssignCarer={handleAssignCarer}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </Card>


      <AddCarerDrawer
        open={addCarerOpen}
        handleClose={() => setAddCarerOpen(!addCarerOpen)}
        carerData={data}
        setData={setData}
      />
      <ConfirmDelete
        open={deleteCarerOpen}
        handleClose={() => {
          setDeleteCarerOpen(false);
          setSelectedCarerID(0);
        }}
        onConfirm={deleteCarer}
      />
      <EditCarer
        open={editCarerOpen}
        setOpen={setEditCarerOpen}
        data={selectedCarerData}
        carerData={data || []}
        setData={setData}
      />
      <AssignServiceList
        open={assignCarerOpen}
        setOpen={setAssignCarerOpen}
        carerID={selectedCarerID}
        carerName={selectedCarerData?.CarerName}
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

        <MenuItem onClick={handleConfigureWeeklyOff}  >
          <ListItemIcon>
            <i className="ri-calendar-schedule-line" />
          </ListItemIcon>
          <ListItemText>Configure Weekly Off</ListItemText>
        </MenuItem>

        <MenuItem onClick={handleManageOffDays} disabled={!selectedCarerForMenu?.Active}>
          <ListItemIcon sx={{ opacity: selectedCarerForMenu?.Active ? 1 : 0.5 }}>
            <i className="ri-calendar-event-line" />
          </ListItemIcon>
          <ListItemText sx={{ opacity: selectedCarerForMenu?.Active ? 1 : 0.5 }} >Manage Off Days</ListItemText>
        </MenuItem>

        <MenuItem onClick={handleCarerSchedule} disabled={!selectedCarerForMenu?.Active}>
          <ListItemIcon sx={{ opacity: selectedCarerForMenu?.Active ? 1 : 0.5 }}>
            <i className="ri-time-line" />
          </ListItemIcon>
          <ListItemText sx={{ opacity: selectedCarerForMenu?.Active ? 1 : 0.5 }} >Calendar</ListItemText>
        </MenuItem>

        <MenuItem onClick={handleRoster} disabled={!selectedCarerForMenu?.Active}>
          <ListItemIcon sx={{ opacity: selectedCarerForMenu?.Active ? 1 : 0.5 }}>
            <i className="ri-file-list-3-line" />
          </ListItemIcon>
          <ListItemText sx={{ opacity: selectedCarerForMenu?.Active ? 1 : 0.5 }} >Roster</ListItemText>
        </MenuItem>

      </Menu>
      <WeeklyOffModal
        open={weeklyOffModalOpen}
        onClose={() => setWeeklyOffModalOpen(false)}
        carer={selectedCarerForMenu}
      />
    </>
  )
}

export default CarerListTable;