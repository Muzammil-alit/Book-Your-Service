'use client'

// React Imports
import React, { useEffect, useState, useMemo } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import Divider from '@mui/material/Divider'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Checkbox from '@mui/material/Checkbox'
import IconButton from '@mui/material/IconButton'
import { styled } from '@mui/material/styles'
import TablePagination from '@mui/material/TablePagination'
import type { TextFieldProps } from '@mui/material/TextField'
import Menu from '@mui/material/Menu'
import FormGroup from '@mui/material/FormGroup'
import FormControlLabel from '@mui/material/FormControlLabel'
import Tooltip from '@mui/material/Tooltip'
import InputAdornment from '@mui/material/InputAdornment'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc';



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
import type { UserType } from '@/types/apps/userTypes'
import type { Locale } from '@configs/i18n'

// Component Imports
import TableFilters from './TableFilters'
import AddUserDrawer from './AddUserDrawer'
import OptionMenu from '@core/components/option-menu'
import CustomAvatar from '@core/components/mui/Avatar'

// Util Imports
import { getInitials } from '@/utils/getInitials'

// Style Imports
import tableStyles from '@core/styles/table.module.css'
import { deleteUserApiCall } from './action'
import ConfirmDelete from './ConfimDelete'
import EditUserInfo from './EditUserInfo'
import { CardContent, Grid, Skeleton } from '@mui/material'

import { useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import { GetFormattedDateTimeUTCString } from '@/utils/commonFunction'

declare module '@tanstack/table-core' {
  interface FilterFns {
    fuzzy: FilterFn<unknown>
  }
  interface FilterMeta {
    itemRank: RankingInfo
  }
}

export type UserTypeWithAction = {
  FirstName: string
  LastName: string
  EmailID: string
  CreatedOn?: string | Date | null
  CreatedByUserName?: string
  UpdatedOn?: string | Date | null
  UpdatedByUserName?: string
  Active: boolean
  UserID?: number | string
  action?: string
}


type UserRoleType = {
  [key: string]: { icon: string; color: string }
}

type UserStatusType = {
  [key: string]: ThemeColor
}

// Styled Components
const Icon = styled('i')({})

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

const userStatusObj: UserStatusType = {
  active: 'success',
  inactive: 'error'
}

// Column Definitions
const columnHelper = createColumnHelper<UserTypeWithAction>()

const UserListTable = ({ tableData, loading }) => {

  dayjs.extend(utc);


  // States
  const [addUserOpen, setAddUserOpen] = useState(false)
  const [deleteUserOpen, setDeleteUserOpen] = useState(false);
  const [editUserOpen, setEditUserOpen] = useState(false);
  const [rowSelection, setRowSelection] = useState({})
  const [data, setData] = useState<UserType[]>([]);
  const [filteredData, setFilteredData] = useState(data)
  const [globalFilter, setGlobalFilter] = useState('');
  const [selectedUserID, setSelectedUserID] = useState<number>();
  const [selectedUserData, setSelectedUserData] = useState<UserType>();

  const loggedInUser = useSelector((state: any) => state.authReducer.admin.user);




  // Column visibility state
  const [columnVisibility, setColumnVisibility] = useState(() => {
    // Default visibility (hide audit columns by default)
    const defaultVisibility = {
      CreatedOn: false,
      CreatedBy: false,
      UpdatedOn: false,
      UpdatedBy: false
    };

    // Only run localStorage code on client side
    if (typeof window !== 'undefined') {
      // Load saved column visibility from localStorage
      const savedVisibility = localStorage.getItem('settingsUserTableColumnVisibility')

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

  // Column picker menu state
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)

  const handleColumnMenuClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleColumnMenuClose = () => {
    setAnchorEl(null)
  }

  // Save column visibility to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('settingsUserTableColumnVisibility', JSON.stringify(columnVisibility))
  }, [columnVisibility])

  React.useEffect(() => {
    if (tableData && tableData?.length > 0) {
      setData(tableData);
    }
  }, [tableData]);

  const handleDeleteUser = async (userID: any) => {
    if (loggedInUser && loggedInUser.userID === userID) {
      toast.error("You cannot delete your own account");
      return;
    }

    setSelectedUserID(userID);
    setDeleteUserOpen(true);
  }

  const deleteUser = async () => {
    await deleteUserApiCall(selectedUserID!, () => {
      setData(data?.filter(product => product.UserID !== selectedUserID));
    })
    setDeleteUserOpen(false);
  }

  const handleEditUser = (userData: any) => {
    setEditUserOpen(true);
    setSelectedUserData(userData);
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
    localStorage.setItem('settingsUserTableColumnVisibility', JSON.stringify(defaultVisibility))
  }


  const columns = useMemo<ColumnDef<UserTypeWithAction, any>[]>(
    () => [


      columnHelper.accessor('FirstName', {
        header: 'User name',
        cell: ({ row }) => (
          <div className='flex items-center gap-3'>
            {getAvatar({ avatar: "", fullName: row.original.FirstName + ' ' + row.original.LastName })}
            <div className='flex flex-col'>
              <Typography color='text.primary' className='font-medium'>
                {`${row.original.FirstName} ${row.original.LastName}`}
              </Typography>
            </div>
          </div>
        )
      }),
      columnHelper.accessor('EmailID', {
        header: 'Email',
        cell: ({ row }) => <Typography className='font-medium'>{row.original.EmailID}</Typography>
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
              color={row.original.Active ? userStatusObj['active'] : userStatusObj['inactive']}
              className='capitalize'
            />
          </div>
        )
      }),
      columnHelper.accessor('action', {
        header: 'Action',
        cell: ({ row }) => (
          <div className='flex items-center gap-0.5'>
            <IconButton size='small' onClick={() => { handleEditUser(row.original) }}>
              <i className='ri-edit-box-line text-textSecondary' />
            </IconButton>
            <IconButton size='small' onClick={() => handleDeleteUser(row.original.UserID!)}>
              <i className='ri-delete-bin-7-line text-textSecondary' />
            </IconButton>
          </div>
        ),
        enableSorting: false
      })
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      },
      sorting: [
        {
          id: 'FirstName',
          desc: false
        }
      ]
    },
    enableRowSelection: true, //enable row selection for all rows
    // enableRowSelection: row => row.original.age > 18, // or enable row selection conditionally per row
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
    getFacetedMinMaxValues: getFacetedMinMaxValues(),
  })

  const getAvatar = (params) => {
    const { avatar, fullName } = params

    if (avatar) {
      return <CustomAvatar src={avatar} skin='light' size={34} />
    } else {
      return (
        <CustomAvatar skin='light' size={34}>
          {getInitials(fullName as string)}
        </CustomAvatar>
      )
    }
  }

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
            md={6}
            container
            spacing={2}
            alignItems="center"
            sx={{ flexWrap: 'wrap' }}
          >
            <Grid item xs={12} sm="auto">
              <TableFilters setData={setFilteredData} tableData={data} loading={loading} />
            </Grid>
            <Grid item xs={12} sm="auto">
                <TextField
                  value={globalFilter ?? ''}
                  onChange={(e) => setGlobalFilter(e.target.value)}
                  placeholder="Search User"
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
            md={6}
            container
            spacing={2}
            justifyContent={{ xs: 'flex-start', md: 'flex-end' }}
            alignItems="center"
            sx={{ flexWrap: 'wrap' }}
          >
            <Grid item>
                <Button
                  variant="contained"
                  onClick={() => setAddUserOpen(!addUserOpen)}
                  className="h-[40px]"
                >
                  Add New User
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
                        <i className={anchorEl ? 'ri-arrow-up-s-line' : 'ri-arrow-down-s-line'} />
                      }
                      size="small"
                      className="h-[40px]"
                    >
                      Columns
                    </Button>
                  </Tooltip>

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
                </>
            </Grid>
          </Grid>
        </Grid>

        {loading ? (
          <div className="overflow-x-auto">
            <table className={tableStyles.table}>
              <thead>
                <tr>
                  {Array.from({ length: 5 }).map((_, index) => (
                    <th key={`skeleton-head-${index}`}>
                      <Skeleton
                        variant="rectangular"
                        animation="wave"
                        height={20}
                        sx={{ borderRadius: 1 }}
                      />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 5 }).map((_, rowIndex) => (
                  <tr key={`skeleton-row-${rowIndex}`}>
                    {Array.from({ length: 5 }).map((_, colIndex) => (
                      <td key={`skeleton-cell-${rowIndex}-${colIndex}`}>
                        <Skeleton
                          variant="rectangular"
                          animation="wave"
                          height={20}
                          sx={{ borderRadius: 1 }}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className={tableStyles.table}>
                <thead>
                  {table.getHeaderGroups().map(headerGroup => (
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
                                asc: <i className="ri-arrow-up-s-line text-xl" />,
                                desc: <i className="ri-arrow-down-s-line text-xl" />
                              }[header.column.getIsSorted() as 'asc' | 'desc'] ?? null}
                            </div>
                          )}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                {table.getFilteredRowModel().rows.length === 0 ? (
                  <tbody>
                    <tr>
                      <td colSpan={table.getVisibleFlatColumns().length} className="text-center">
                        No data available
                      </td>
                    </tr>
                  </tbody>
                ) : (
                  <tbody>
                    {table
                      .getRowModel()
                      .rows.slice(0, table.getState().pagination.pageSize)
                      .map(row => (
                        <tr key={row.id} className={classnames({ selected: row.getIsSelected() })}>
                          {row.getVisibleCells().map(cell => (
                            <td key={cell.id}>
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </td>
                          ))}
                        </tr>
                      ))}
                  </tbody>
                )}
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
                inputProps: { 'aria-label': 'rows per page' }
              }}
              onPageChange={(_, page) => {
                table.setPageIndex(page);
              }}
              onRowsPerPageChange={e => table.setPageSize(Number(e.target.value))}
            />
          </>
        )}
      </Card>






      <AddUserDrawer
        open={addUserOpen}
        handleClose={() => setAddUserOpen(!addUserOpen)}
        userData={data}
        setData={setData}
      />
      <ConfirmDelete
        open={deleteUserOpen}
        handleClose={() => {
          setDeleteUserOpen(false);
          setSelectedUserID(0);
        }}
        userID={selectedUserID!}
        onConfirm={deleteUser}
      />

      <EditUserInfo
        open={editUserOpen}
        setOpen={setEditUserOpen}
        userID={selectedUserData?.UserID}
        setData={setData}
      />
    </>
  )
}

export default UserListTable
