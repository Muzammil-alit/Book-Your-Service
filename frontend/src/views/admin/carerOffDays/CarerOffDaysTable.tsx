'use client'

// React Imports
import React, { useEffect, useState, useMemo } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import TablePagination from '@mui/material/TablePagination'
import type { TextFieldProps } from '@mui/material/TextField'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import FormGroup from '@mui/material/FormGroup'
import FormControlLabel from '@mui/material/FormControlLabel'
import Checkbox from '@mui/material/Checkbox'
import Divider from '@mui/material/Divider'
import Grid from '@mui/material/Grid'
import Tooltip from '@mui/material/Tooltip'
import Box from '@mui/material/Box'
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
import { CarerType } from '@/types/apps/carerTypes'
import { CarerOffDayRecord } from './action'

// Component Imports
import EditOffDaysModal from './EditOffDaysModal'
import DeleteOffDaysModal from './DeleteOffDaysModal'
import TableFilters from './TableFilters'

// Style Imports
import tableStyles from '@core/styles/table.module.css'
import dayjs from 'dayjs'
import { GetFormattedDateTimeUTCString } from '@/utils/commonFunction'



declare module '@tanstack/table-core' {
  interface FilterFns {
    fuzzy: FilterFn<unknown>
  }
  interface FilterMeta {
    itemRank: RankingInfo
  }
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

interface CarerOffDaysTableProps {
  data: CarerOffDayRecord[];
  carer: CarerType;
  refreshData: () => Promise<void>;
  loading: boolean
  addModalOpen: any;
  setAddModalOpen: any;
  anchorEl: any;
  open: any;
  handleColumnMenuClose: any;
  globalFilter: any;

  onDelete?: any;
  onEdit?: any
  columnVisibility?: any;
  onColumnVisibilityChange: any
}

// Column Definitions
const columnHelper = createColumnHelper<CarerOffDayRecord>()

const CarerOffDaysTable = ({ data, carer, refreshData, addModalOpen, setAddModalOpen, loading, anchorEl, open, handleColumnMenuClose, globalFilter }: CarerOffDaysTableProps) => {
  // States
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [rowSelection, setRowSelection] = useState({})
  const [filteredData, setFilteredData] = useState(data)
  const [selectedRecord, setSelectedRecord] = useState<CarerOffDayRecord | null>(null);

  // Column visibility state
  const [columnVisibility, setColumnVisibility] = useState(() => {
    // Load saved column visibility from localStorage
    const savedVisibility = localStorage.getItem('carerOffDaysTableColumnVisibility')

    // If saved visibility exists, use it
    if (savedVisibility) {
      return JSON.parse(savedVisibility)
    }

    // Otherwise, set default visibility (hide audit columns by default)
    return {
      CreatedOn: false,
      CreatedByName: false,
      UpdatedOn: false,
      UpdatedByName: false
    }
  })

  // Update filtered data when data changes
  useEffect(() => {
    setFilteredData(data)
  }, [data])

  // Save column visibility to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('carerOffDaysTableColumnVisibility', JSON.stringify(columnVisibility))
  }, [columnVisibility])




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
  }

  // Handle edit and delete actions
  const handleEdit = (record: CarerOffDayRecord) => {
    setSelectedRecord(record);
    setEditModalOpen(true);
  };

  const handleDelete = (record: CarerOffDayRecord) => {
    setSelectedRecord(record);
    setDeleteModalOpen(true);
  };

  // Calculate days between two dates
  const calculateDaysBetween = (dateFrom: string, dateTo: string): number => {
    const start = new Date(dateFrom);
    const end = new Date(dateTo);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays + 1; // Include both start and end dates
  };

  // Handle add new off days
  const handleAddOffDays = () => {
    setSelectedRecord(null);
    setAddModalOpen(true);
  };

  const columns = useMemo<ColumnDef<CarerOffDayRecord, any>[]>(
    () => [
      columnHelper.accessor('DateFrom', {
        header: 'Date From',
        cell: ({ row }) => (
          <Typography className="font-medium">

            {row.original.DateFrom && dayjs(row.original.DateFrom).format('DD/MM/YYYY')}
          </Typography>
        )
      }),
      columnHelper.accessor('DateTo', {
        header: 'Date To',
        cell: ({ row }) => (
          <Typography className="font-medium">

            {row.original.DateTo && dayjs(row.original.DateTo).format('DD/MM/YYYY')}
          </Typography>
        )
      }),
      columnHelper.accessor(row => calculateDaysBetween(row.DateFrom, row.DateTo), {
        id: 'offDays',
        header: 'Off Days',
        cell: ({ getValue }) => (
          <Typography className="font-medium">
            {getValue()} {getValue() == 1 ? 'Day' : 'Days'}
          </Typography>
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
      columnHelper.accessor('carerOffDayID', {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <div className='flex items-center gap-1'>
            <Tooltip title="Edit">
              <IconButton size="small" onClick={() => handleEdit(row.original)}>
                <i className="ri-edit-box-line text-textSecondary" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete">
              <IconButton size="small" onClick={() => handleDelete(row.original)}>
                <i className="ri-delete-bin-7-line text-textSecondary" />
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
    data: filteredData,
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
        pageSize: 10
      }
    },
    enableRowSelection: true,
    globalFilterFn: fuzzyFilter,
    onRowSelectionChange: setRowSelection,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    // onGlobalFilterChange: setGlobalFilter,
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues()
  })

  return (
    <>

      <Box className={tableStyles.tableContainer}>




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



        <div className='overflow-x-auto'>
          <table className={tableStyles.table}>
            <thead>
              {table.getHeaderGroups().map(headerGroup => (
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
              ))}
            </thead>

            {table.getRowModel().rows?.length === 0 ? (
              <tbody>
                <tr>
                  <td colSpan={table.getVisibleFlatColumns().length} className='text-center'>
                    No off days configured for this carer
                  </td>
                </tr>
              </tbody>
            ) : (
              <tbody>
                {table
                  .getRowModel()
                  .rows.slice(0, table.getState().pagination.pageSize)
                  .map(row => {
                    return (
                      <tr key={row.id} className={classnames({ selected: row.getIsSelected() })}>
                        {row.getVisibleCells().map(cell => (
                          <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                        ))}
                      </tr>
                    )
                  })}
              </tbody>
            )}
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
      </Box>

      {/* Modals */}
      {selectedRecord && (
        <>
          <EditOffDaysModal
            open={editModalOpen}
            onClose={() => setEditModalOpen(false)}
            record={selectedRecord}
            carer={carer}
            refreshData={refreshData}
          />

          <DeleteOffDaysModal
            open={deleteModalOpen}
            onClose={() => setDeleteModalOpen(false)}
            record={selectedRecord}
            carer={carer}
            refreshData={refreshData}
          />
        </>
      )}

      {/* Add Modal */}
      <EditOffDaysModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        record={selectedRecord}
        carer={carer}
        refreshData={refreshData}
        isNewRecord={true}
      />
    </>
  )
}

export default CarerOffDaysTable 