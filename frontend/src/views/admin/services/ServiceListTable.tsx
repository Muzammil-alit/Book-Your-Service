'use client'

// React Imports
import React, { useEffect, useState, useMemo } from 'react'

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
import FormGroup from '@mui/material/FormGroup'
import FormControlLabel from '@mui/material/FormControlLabel'
import Checkbox from '@mui/material/Checkbox'
import Divider from '@mui/material/Divider'
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

// Type Imports
import type { ThemeColor } from '@core/types'

// Component Imports
import TableFilters from './TableFilters'
import AddServiceDrawer from './AddServiceDrawer'


// Style Imports
import tableStyles from '@core/styles/table.module.css'
import { deleteServiceApiCall } from './action';
import ConfirmDelete from './ConfimDelete'
import EditService from './EditService'
import { Grid, Skeleton, Tooltip } from '@mui/material'
import { ServiceType } from '@/types/apps/servicesTypes'
import AssignCarerList from './AssignCarerList'
import { GetFormattedDateTimeUTCString } from '@/utils/commonFunction'


declare module '@tanstack/table-core' {
  interface FilterFns {
    fuzzy: FilterFn<unknown>
  }
  interface FilterMeta {
    itemRank: RankingInfo
  }
}

interface ServiceTypeWithAction {
  ServiceID: number;
  ServiceName: string;
  Descr: string;
  ServiceDurationType: boolean;
  Active: boolean;
  CreatedOn?: string | Date | null;
  CreatedByUserName?: string;
  UpdatedOn?: string | Date | null;
  UpdatedByUserName?: string;
  action?: string;
}

type ServiceStatusType = {
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

const serviceStatusObj: ServiceStatusType = {
  active: 'success',
  inactive: 'error'
}

// Column Definitions
const columnHelper = createColumnHelper<ServiceTypeWithAction>()

const ServiceListTable = ({ tableData, loading }: { tableData?: ServiceType[], loading?: boolean }) => {
  // States
  const [addServiceOpen, setAddServiceOpen] = useState(false)
  const [deleteServiceOpen, setDeleteServiceOpen] = useState(false);
  const [editServiceOpen, setEditServiceOpen] = useState(false);
  const [assignCarerOpen, setAssignCarerOpen] = useState(false);
  const [rowSelection, setRowSelection] = useState({})
  const [data, setData] = useState<ServiceType[]>([]);
  const [filteredData, setFilteredData] = useState(data)
  const [globalFilter, setGlobalFilter] = useState('');
  const [selectedServiceID, setSelectedServiceID] = useState<number>();
  const [selectedServiceData, setSelectedServiceData] = useState<ServiceType>();

  // Column visibility state
  const [columnVisibility, setColumnVisibility] = useState(() => {
    // Load saved column visibility from localStorage
    const savedVisibility = localStorage.getItem('serviceTableColumnVisibility')

    // If saved visibility exists, use it
    if (savedVisibility) {
      return JSON.parse(savedVisibility)
    }

    // Otherwise, set default visibility (hide audit columns by default)
    return {
      createdOn: false,
      createdBy: false,
      updatedOn: false,
      updatedBy: false
    }
  })





  // Save column visibility to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('serviceTableColumnVisibility', JSON.stringify(columnVisibility))
  }, [columnVisibility])

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
      CreatedOn: false,
      CreatedByUserName: false,
      UpdatedOn: false,
      UpdatedByUserName: false
    }

    // Set all other columns to visible
    table.getAllLeafColumns().forEach(column => {
      if (!Object.keys(defaultVisibility).includes(column.id)) {
        defaultVisibility[column.id] = true
      }
    })

    setColumnVisibility(defaultVisibility)
    localStorage.setItem('serviceTableColumnVisibility', JSON.stringify(defaultVisibility))
  }

  React.useEffect(() => {
    if (tableData && tableData?.length > 0) {
      setData(tableData);
    } else {
      setData([]);
    }
  }, [tableData]);

  useEffect(() => {
    if (globalFilter === '') {
      setFilteredData(data);
    } else {
      const filtered = data.filter(service => {
        const matchPattern = new RegExp(globalFilter.toLowerCase(), 'i');
        return (
          matchPattern.test(service.ServiceName.toLowerCase()) ||
          (service.Descr && matchPattern.test(service.Descr.toLowerCase()))
        );
      });
      setFilteredData(filtered);
    }
  }, [globalFilter]);


  const handleDeleteService = async (serviceID: number) => {
    setSelectedServiceID(serviceID);
    setDeleteServiceOpen(true);
  }

  const handleAssignCarer = (serviceID: number, serviceName: string) => {
    setSelectedServiceID(serviceID);
    setSelectedServiceData(data.find(service => service.ServiceID === serviceID));
    setAssignCarerOpen(true);
  }

  const deleteService = async () => {
    await deleteServiceApiCall(selectedServiceID!, () => {
      setData(data?.filter(product => product.ServiceID !== selectedServiceID));
    })
    setDeleteServiceOpen(false);
  }

  const handleEditService = (serviceData: any) => {
    setEditServiceOpen(true);
    setSelectedServiceData(serviceData);
  }

  const columns = useMemo<ColumnDef<ServiceTypeWithAction, any>[]>(
    () => [
      columnHelper.accessor('ServiceName', {
        header: 'Service Name',
        cell: ({ row }) => (
          <div className='flex items-center gap-3'>
            <div className='flex flex-col'>
              <Typography color='text.primary' className='font-medium'>
                {row.original.ServiceName}
              </Typography>
            </div>
          </div>
        )
      }),
      columnHelper.accessor('Descr', {
        header: 'Description',
        cell: ({ row }) => <Typography className="font-medium whitespace-pre-wrap break-words"
          style={{
            minWidth: '200px',
            maxWidth: '100%',
            wordBreak: 'break-word'
          }} >
          {row.original.Descr}
        </Typography>
      }),


      columnHelper.accessor('ServiceDurationType', {
        header: 'Service Duration Type',
        cell: ({ row }) => <Typography className='font-medium'>
          {row.original.ServiceDurationType == true ? 'Variable' : 'Fixed'}
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
              color={row.original.Active ? serviceStatusObj['active'] : serviceStatusObj['inactive']}
              className='capitalize'
            />
          </div>
        )
      }),
      // columnHelper.accessor('duration', {
      //   header: 'Duration',
      //   cell: ({ row }) => <Typography className='font-medium'>{row.original.duration ? `${row.original.duration} ${row.original.duration > 1 ? 'Hours' : 'Hour'}` : ''}</Typography>
      // }),
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
      columnHelper.accessor('action', {
        header: 'Action',
        cell: ({ row }) => (
          <div className='flex items-center gap-0.5'>
            <IconButton size='small' onClick={() => { handleEditService(row.original) }}>
              <i className='ri-edit-box-line text-textSecondary' />
            </IconButton>
            <IconButton size='small' onClick={() => handleDeleteService(row.original.ServiceID!)}>
              <i className='ri-delete-bin-7-line text-textSecondary' />
            </IconButton>
            <Tooltip title="Assign carers to this service">
              <IconButton size="small" color="primary" onClick={() => handleAssignCarer(row.original.ServiceID!, row.original.ServiceName)}>
                <i className='ri-user-add-line' />
              </IconButton>
            </Tooltip>
          </div>
        ),
        enableSorting: false
      })
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data, filteredData]
  )

  const table = useReactTable({
    data: filteredData as ServiceType[],
    columns,
    filterFns: {
      fuzzy: fuzzyFilter
    },
    state: {
      rowSelection,
      globalFilter,
      columnVisibility
    },
    initialState: {
      pagination: {
        pageSize: 5,
        pageIndex: 0
      }
    },
    enableRowSelection: true,
    globalFilterFn: fuzzyFilter,
    onRowSelectionChange: setRowSelection,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues()
  })

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
          {/* Filters + Search */}
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
              <TableFilters setData={setFilteredData} tableData={data} />
            </Grid>

            <Grid item xs={12} sm="auto">
              <TextField
                value={globalFilter ?? ''}
                onChange={(e) => setGlobalFilter(e.target.value)}
                placeholder="Search Service"
                variant="outlined"
                sx={{ width: 200 }}
                size="small"
                className="w-[200px] md:w-[250px] lg:w-[300px]"
              />
            </Grid>
          </Grid>

          {/* Action Buttons */}
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
            <Grid item>
              <Button
                variant="contained"
                onClick={() => setAddServiceOpen(!addServiceOpen)}
              >
                Add New Service
              </Button>
            </Grid>

            <Grid item>
              <>
                <Tooltip title="Show/Hide Columns">
                  <Button
                    variant="outlined"
                    onClick={handleColumnMenuClick}
                    startIcon={<i className="ri-table-line" />}
                    endIcon={
                      <i
                        className={anchorEl ? 'ri-arrow-up-s-line' : 'ri-arrow-down-s-line'}
                      />
                    }
                    size="small"
                  >
                    Columns
                  </Button>
                </Tooltip>

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
                            fontSize: '0.875rem'
                          }
                        }}
                      />
                    ))}
                  </FormGroup>
                </Menu>
              </>
            </Grid>
          </Grid>
        </Grid>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className={tableStyles.table}>
            <thead>
              {loading ? (
                <tr>
                  {[...Array(5)].map((_, idx) => (
                    <th key={`skeleton-head-${idx}`}>
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
                              'cursor-pointer select-none': header.column.getCanSort(),
                            })}
                            onClick={header.column.getToggleSortingHandler()}
                          >
                            {flexRender(header.column.columnDef.header, header.getContext())}
                            {{
                              asc: <i className="ri-arrow-up-s-line text-xl" />,
                              desc: <i className="ri-arrow-down-s-line text-xl" />,
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
                    {[...Array(5)].map((_, colIndex) => (
                      <td key={`skeleton-cell-${rowIndex}-${colIndex}`}>
                        <div className="h-[20px] bg-gray-300 rounded animate-wave" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td colSpan={table.getVisibleFlatColumns().length} className="text-center">
                    No data available
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows
                  .slice(0, table.getState().pagination.pageSize)
                  .map(row => (
                    <tr key={row.id} className={classnames({ selected: row.getIsSelected() })}>
                      {row.getVisibleCells().map(cell => (
                        <td key={cell.id}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>

        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          className="border-bs"
          count={table.getFilteredRowModel().rows.length}
          rowsPerPage={table.getState().pagination.pageSize}
          page={table.getState().pagination.pageIndex}
          SelectProps={{
            inputProps: { 'aria-label': 'rows per page' },
          }}
          onPageChange={(_, page) => {
            table.setPageIndex(page);
          }}
          onRowsPerPageChange={e => table.setPageSize(Number(e.target.value))}
        />
      </Card>




      <AddServiceDrawer
        open={addServiceOpen}
        handleClose={() => setAddServiceOpen(!addServiceOpen)}
        serviceData={data}
        setData={setData}
      />
      <ConfirmDelete
        open={deleteServiceOpen}
        handleClose={() => {
          setDeleteServiceOpen(false);
          setSelectedServiceID(0);
        }}
        onConfirm={deleteService}
      />
      <EditService
        open={editServiceOpen}
        setOpen={setEditServiceOpen}
        data={data}
        selectedService={selectedServiceData}
        setData={setData}
      />
      <AssignCarerList
        open={assignCarerOpen}
        setOpen={setAssignCarerOpen}
        serviceName={selectedServiceData?.ServiceName}
        serviceID={selectedServiceID}
      />
    </>
  )
}

export default ServiceListTable
