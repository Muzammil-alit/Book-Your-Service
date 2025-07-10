// React Imports
import { useState, useEffect } from 'react'

// MUI Imports
import FormControl from '@mui/material/FormControl'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'

// Type Imports
import { CarerType } from '@/types/apps/carerTypes'

const TableFilters = ({ setData, tableData }: { setData: (data: CarerType[]) => void; tableData?: CarerType[] }) => {


  const [status, setStatus] = useState<any>('all');


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
          size='small'
          fullWidth
          id='select-status'
          value={status}
          onChange={e => setStatus(e.target.value)}
          labelId='status-select'
          sx={{ width: 200 }}
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
