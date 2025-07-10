// React Imports
import { useState, useEffect } from 'react'

// MUI Imports
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'

// Type Imports

interface TableFiltersProps {
  setData: (data: any[]) => void;
  tableData: any[];
  loading: boolean;
}

const TableFilters = ({ setData, tableData, loading }: TableFiltersProps) => {

  const [status, setStatus] = useState<string>('all');

  useEffect(() => {
    const filteredData = tableData?.filter((user: any) => {
      if (status == 'all') return true
      if (status && user.Active.toString() !== status) return false;
      return true;
    });

    setData(filteredData || [])
  }, [status, tableData, setData])

  return (
    <>
        <FormControl fullWidth sx={{ width: 200, backgroundColor: 'white' }}>
          <InputLabel id='status-select'>Status</InputLabel>
          <Select
            fullWidth
            id='select-status'
            value={status}
            onChange={e => setStatus(e.target.value)}
            labelId='status-select'
            label="Status"
            size='small'
          >
            <MenuItem value='all'>All</MenuItem>
            <MenuItem value='true'>Active</MenuItem>
            <MenuItem value='false'>Inactive</MenuItem>
          </Select>
        </FormControl>
    </>

  )
}

export default TableFilters
