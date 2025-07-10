// React Imports
import React, { useEffect } from 'react'

// MUI Imports
import { Typography } from '@mui/material'
import { useAppSelector } from '@/redux/useAppSelector'
import { useDispatch } from 'react-redux'
import { getAllCarersApiCall } from './action'
import CarerListTable from './CarerListTable'

const CarersPage = () => {
  const dispatch = useDispatch()

  useEffect(() => {
    getAllCarersApiCall(dispatch)
  }, [dispatch])

  return (
    <div>
      <Typography variant='h5' className='mb-4'>Carers Management</Typography>
      <CarerListTable tableData={useAppSelector((state) => state.carersReducer.carers)} />
    </div>
  )
}

export default CarersPage 