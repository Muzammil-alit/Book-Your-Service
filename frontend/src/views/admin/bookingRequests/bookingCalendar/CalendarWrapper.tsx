'use client'

import { Card } from '@mui/material'
import Calendar from './Calendar'


const AppCalendar = ({ data, handleViewModeChange, viewMode }) => {

  return (


    <div className=' pbe-0 flex-grow overflow-visible rounded'>
      <Card className='p-5 overflow-visible'>
        <Calendar
          data={data}
          handleViewModeChange={handleViewModeChange}
          viewMode={viewMode}
        />

      </Card>
    </div>
  )
}

export default AppCalendar
