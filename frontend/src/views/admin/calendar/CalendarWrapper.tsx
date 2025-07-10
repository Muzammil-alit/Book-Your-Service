'use client'


import { Card } from '@mui/material'
import Calendar from './Calendar'

const AppCalendar = (data: any) => {

  return (
    <div className=' pbe-0 flex-grow overflow-visible rounded'>
      <Card className='p-5 overflow-visible'>
        <Calendar
        />

      </Card>
    </div>
  )
}

export default AppCalendar
