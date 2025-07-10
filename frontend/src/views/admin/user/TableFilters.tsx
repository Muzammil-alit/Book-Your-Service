// React Imports
import { useState, useEffect } from 'react'

// MUI Imports
import FormControl from '@mui/material/FormControl'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'

// Type Imports
import type { UserType } from '@/types/apps/userTypes'

const TableFilters = ({ setData, tableData, loading }) => {

  const [status, setStatus] = useState<UserType['status']>('all')

  useEffect(() => {
    const filteredData = tableData?.filter(user => {
      if (status == 'all') return true
      if (status && user.Active.toString() !== status) return false;
      return true;
    });

    setData(filteredData || [])
  }, [status, tableData, setData])

  return (


    <>
      <FormControl fullWidth sx={{ width: 200, backgroundColor: 'white' }}>
        <Select
          fullWidth
          id='select-status'
          value={status}
          onChange={e => setStatus(e.target.value)}
          labelId='status-select'
          sx={{ width: 200 }}
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
