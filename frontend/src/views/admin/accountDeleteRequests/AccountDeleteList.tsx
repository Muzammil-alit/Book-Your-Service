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
  getSortedRowModel
} from '@tanstack/react-table'
import { Grid, Skeleton } from '@mui/material'
import type { ColumnDef, FilterFn } from '@tanstack/react-table'
import type { RankingInfo } from '@tanstack/match-sorter-utils'

// Style Imports
import tableStyles from '@core/styles/table.module.css'
import { Chip, Divider, Tooltip, MenuItem, ListItemIcon, ListItemText, Menu } from '@mui/material'
import TableFilters from './TableFilters'
import { ThemeColor } from '@/@core/types'
import { updateAccountDeleteRequestApiCall } from './action'
import { toast } from 'react-toastify'
import dayjs from 'dayjs'
import { AccountDeleteRequestType } from '@/types/apps/accountDeleteRequestsType'


interface Filters {
  userID: string;
  dateFrom: string;
  dateTo: string;
}

type UserStatusType = {
  [key: string]: ThemeColor
}

const logStatusObj: UserStatusType = {
  success: 'success',
  failed: 'error',
}

interface AccountDeleteRequestsProps {
  tableData: AccountDeleteRequestType[];
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
  fetchTableData: () => void;
  loading: boolean;
}

declare module '@tanstack/table-core' {
  interface FilterFns {
    fuzzy: FilterFn<unknown>
  }
  interface FilterMeta {
    itemRank: RankingInfo
  }
}

type AccountDeleteTypeWithAction = AccountDeleteRequestType & {
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
const columnHelper = createColumnHelper<AccountDeleteTypeWithAction>()

const AccountDeleteRequests: React.FC<AccountDeleteRequestsProps> = ({ tableData, filters, setFilters, fetchTableData, loading }) => {
  // States
  const [rowSelection, setRowSelection] = useState({})
  const [data, setData] = useState<AccountDeleteRequestType[]>([]);
  const [globalFilter, setGlobalFilter] = useState('');


  React.useEffect(() => {
    if (tableData && tableData?.length > 0) {
      setData(tableData);
    } else {
      setData([]);
    }
  }, [tableData]);










  const [selectedRequest, setSelectedRequest] = useState<AccountDeleteRequestType | null>(null)
  const [anchorElMenu, setAnchorElMenu] = useState<null | HTMLElement>(null);


  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, data: any) => {
    setAnchorElMenu(event.currentTarget);
    setSelectedRequest(data)
  };

  const handleMenuClose = () => {
    setAnchorElMenu(null);
  };




  const columns = useMemo<ColumnDef<AccountDeleteTypeWithAction, any>[]>(
    () => [
      columnHelper.accessor('ClientName', {
        header: 'Client Name',
        cell: ({ row }) => <Typography className='font-medium'>{row.original.ClientName || ""}</Typography>
      }),
      columnHelper.accessor('CreatedOn', {
        header: 'Requested On',
        cell: ({ row }) => <Typography className='font-medium'>
          {row.original.CreatedOn ? dayjs(row.original.CreatedOn).utc().format('DD/MM/YYYY hh:mm A') : ""}
        </Typography>
      }),
      columnHelper.accessor('DeleteStatus', {
        header: 'Status',
        cell: ({ row }) => {
          var status
          if (row.original.DeleteStatus == 0) {
            return <Chip color="warning" label="Pending" variant="outlined" >{status}</Chip>
          }
          else if (row.original.DeleteStatus == 1) {
            return <Chip color="success" label="Confirmed" variant="outlined" >{status}</Chip>
          }
          else {
            return <Chip color="info" label="Reactivated" variant="outlined" >{status}</Chip>
          }
        },
      }),
      columnHelper.accessor('Reason', {
        header: 'Reason',
        cell: ({ row }) => <Typography className='font-medium'>{row.original.Reason}</Typography>
      }),


      columnHelper.accessor('action', {
        header: 'Action',
        cell: ({ row }) => (


          <Tooltip title="More options">
            <IconButton
              size="small"
              aria-label="more options"
              onClick={(e) => handleMenuOpen(e, row.original)}
            >
              <i className='ri-more-2-fill' />
            </IconButton>
          </Tooltip>
        ),
        enableSorting: false
      })



    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data]
  )

  const table = useReactTable({
    data: data as AccountDeleteRequestType[],
    columns,
    filterFns: {
      fuzzy: fuzzyFilter
    },
    state: {
      rowSelection,
      globalFilter
    },
    initialState: {
      pagination: {
        pageSize: 10
      }
    },
    enableRowSelection: true,
    globalFilterFn: fuzzyFilter,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues()
  })

  const onFilterChange = (dateFrom: string | undefined, dateTo: string | undefined, userID: string | undefined) => {

    setFilters({
      ...filters,
      dateFrom: dateFrom!,
      dateTo: dateTo!,
      userID: userID!,
    });
  }

  const handleAction = async (type: string) => {

    const status = type == 'confirm' ? 1 : 2

    try {
      if (selectedRequest) {
        const response = await updateAccountDeleteRequestApiCall(selectedRequest.AccountDeleteRequestID, status)
        if (response?.isOk) {
          toast.success('Delete request status updated successfully')
          fetchTableData()
        }
      }
    }
    catch (err) {

    }


    handleMenuClose()
  }

  return (
    <>
      <Card>

        <Grid className='px-4 my-3'>
          <TableFilters onFilterChange={onFilterChange} />
        </Grid>

        <Divider />


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

            {loading ? (
              <tbody>
                {Array.from({ length: 10 }).map((_, rowIndex) => (
                  <tr key={`skeleton-row-${rowIndex}`}>
                    {table.getVisibleFlatColumns().map((col, colIndex) => (
                      <td key={`skeleton-cell-${rowIndex}-${colIndex}`}>
                        <div className="w-full">
                          <div className="h-[20px] bg-gray-300 rounded animate-wave" />
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            ) : table.getFilteredRowModel().rows.length === 0 ? (
              <tbody>
                <tr>
                  <td colSpan={table.getVisibleFlatColumns().length} className='text-center'>
                    No data available
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
      </Card>


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
        <MenuItem
          onClick={() => { handleAction('confirm') }}
          disabled={selectedRequest?.DeleteStatus !== 0}
          style={{
            opacity: selectedRequest?.DeleteStatus !== 0 ? 0.5 : 1,
            pointerEvents: selectedRequest?.DeleteStatus !== 0 ? 'none' : 'auto',
          }}>
          <ListItemIcon>
            <i className="ri-check-line text-green-600" />
          </ListItemIcon>
          <ListItemText>Confirm</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => { handleAction('reactivate') }}
          disabled={selectedRequest?.DeleteStatus !== 0}
          style={{
            opacity: selectedRequest?.DeleteStatus !== 0 ? 0.5 : 1,
            pointerEvents: selectedRequest?.DeleteStatus !== 0 ? 'none' : 'auto',
          }}
        >
          <ListItemIcon>
            <i className="ri-restart-line text-blue-600" />
          </ListItemIcon>
          <ListItemText>Reactivate</ListItemText>
        </MenuItem>
      </Menu>



    </>
  )
}

export default AccountDeleteRequests
