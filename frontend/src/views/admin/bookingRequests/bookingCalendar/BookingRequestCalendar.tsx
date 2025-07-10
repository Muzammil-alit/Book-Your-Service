// MUI Imports
import Card from '@mui/material/Card'

// Component Imports
import CalendarWrapper from '@/views/admin/bookingRequests/bookingCalendar/CalendarWrapper'

// Styled Component Imports
import AppFullCalendar from '@/libs/styles/AppFullCalendar'

const BookingRequestCalendar = ({ data, handleViewModeChange, viewMode }) => {
  return (
    <Card className='overflow-visible'>
      <AppFullCalendar className='app-calendar'>
        <CalendarWrapper data={data} handleViewModeChange={handleViewModeChange} viewMode={viewMode} />
      </AppFullCalendar>
    </Card>
  )
}

export default BookingRequestCalendar