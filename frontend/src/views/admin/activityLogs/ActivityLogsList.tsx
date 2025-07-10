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
import type { ColumnDef, FilterFn } from '@tanstack/react-table'
import type { RankingInfo } from '@tanstack/match-sorter-utils'

// Style Imports
import tableStyles from '@core/styles/table.module.css'
import { ActivityLogType } from '@/types/apps/activityLogsType'
import ViewLogInfo from './ViewLogInfo'
import { Chip, Divider, TextField, Tooltip } from '@mui/material'
import TableFilters from './TableFilters'
import { UserType } from '@/types/apps/userTypes'
import { ThemeColor } from '@/@core/types'
import { GetFormattedDateTimeUTCString } from '@/utils/commonFunction'
import Grid from '@mui/material/Grid'

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

interface ActivityLogListTableProps {
  tableData: ActivityLogType[];
  totalRecords?: number;
  usersData: UserType[];
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
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

type ActiityLogTypeWithAction = ActivityLogType & {
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
const columnHelper = createColumnHelper<ActiityLogTypeWithAction>()

const ActivityLogListTable: React.FC<ActivityLogListTableProps> = ({ tableData, totalRecords, filters, setFilters, usersData, loading }) => {
  // States
  const [rowSelection, setRowSelection] = useState({})
  const [data, setData] = useState<ActivityLogType[]>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [viewLogOpen, setViewLogOpen] = React.useState(false);

  const [selectedLogData, setSelectedLogData] = React.useState<ActivityLogType>();


  console.log(tableData)
  React.useEffect(() => {
    if (tableData && tableData?.length > 0) {
      setData(tableData);
    } else {
      setData([]);
    }
  }, [tableData]);

  const handleViewLog = (logData: ActivityLogType) => {
    setViewLogOpen(true);
    setSelectedLogData(logData);
  }

  const columns = useMemo<ColumnDef<ActiityLogTypeWithAction, any>[]>(
    () => [
      columnHelper.accessor('createdOn', {
        header: 'Created On',
        cell: ({ row }) => (
          <div className='flex items-center gap-3'>
            <div className='flex flex-col'>
              <Typography color='text.primary' className='font-medium'>
                {row.original.createdOn && GetFormattedDateTimeUTCString(row.original.createdOn)}
              </Typography>
            </div>
          </div>
        ),
      }),
      columnHelper.accessor('createdByName', {
        header: 'Created By',
        cell: ({ row }) => <Typography className='font-medium'>{row.original.createdByName || ""}</Typography>
      }),
      columnHelper.accessor('description', {
        header: 'Description',
        cell: ({ row }) => <Typography className='font-medium'>{row.original.description}</Typography>
      }),
      columnHelper.accessor('statusCode', {
        header: 'Status Code',
        cell: ({ row }) => (
          <div className='flex items-center gap-3'>
            <Chip
              variant='tonal'
              label={row.original?.response?.statusCode}
              size='small'
              color={row.original.response.statusCode >= 400 ? logStatusObj['error'] : logStatusObj['success']}
              className='capitalize'
            />
          </div>
        )
      }),
      columnHelper.accessor('action', {
        header: 'Action',
        cell: ({ row }) => (
          <div className='flex items-center gap-0.5'>
            <IconButton size='small' onClick={() => { handleViewLog(row.original) }}>
              {/* <Link href={'/admin/user/view/10'} className='flex'> */}
              <i className='ri-eye-line text-textSecondary' />
              {/* </Link> */}
            </IconButton>
          </div>
        ),
        enableSorting: false
      })
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data]
  )


  const table = useReactTable({
    data: data as ActivityLogType[],
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



  return (
    <>
      <Card>


        <div className='flex items-center '>
          <TableFilters onFilterChange={onFilterChange} usersData={usersData} loading={loading} />

          <Grid item xs={12} sm="auto">
            <TextField
              value={globalFilter ?? ''}
              onChange={(e) => setGlobalFilter(e.target.value)}
              placeholder="Search Logs"
              variant="outlined"
              className="w-[200px] md:w-[250px] lg:w-[300px]"
              size='small'
            />
          </Grid>

        </div>


        <Divider />


        <>
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
                ) : (
                  table
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
                    ))
                )}
              </tbody>
            </table>
          </div>

          <TablePagination
            rowsPerPageOptions={[10, 25, 50]}
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
            onRowsPerPageChange={(e) => table.setPageSize(Number(e.target.value))}


            labelDisplayedRows={({ from, to, count }) => (
              <span className="flex items-center gap-1">
                {from}–{to} of {count}&nbsp;

                {totalRecords && totalRecords > 1000 && (
                  <>
                    <Tooltip
                      title={
                        <div className="text-xs text-[#676A7B] p-2">
                          <strong className="text-red-400">Notice: Limited Records Displayed</strong><br />
                          We are currently displaying the first <strong className="text-red-400">1000</strong> records out of a total of <strong className="text-red-400">{totalRecords}</strong> records.
                          <br />
                          To view the complete data, please narrow down your search criteria.
                        </div>
                      }
                      arrow
                      placement="top"
                      PopperProps={{
                        modifiers: [{ name: 'offset', options: { offset: [0, 8] } }]
                      }}
                      componentsProps={{
                        tooltip: {
                          sx: {
                            backgroundColor: 'white',
                            boxShadow: 3,
                            color: 'gray',
                            fontSize: '0.875rem',
                            borderRadius: 1,
                            maxWidth: 280,
                            padding: 1.5,
                          },
                          className: 'text-gray-700',
                        },
                        arrow: {
                          sx: {
                            color: 'white',
                          },
                        },
                      }}
                    >
                      <i className="ri-information-line cursor-pointer text-warning text-lg" />
                    </Tooltip>

                  </>
                )}

              </span>
            )}
          />


        </>


      </Card>
      <ViewLogInfo
        open={viewLogOpen}
        setOpen={setViewLogOpen}
        data={selectedLogData!}
      />
    </>
  )
}

export default ActivityLogListTable
