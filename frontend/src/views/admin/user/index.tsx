"use client";

import Grid from '@mui/material/Grid2'
import UserListTable from './UserListTable';
import { useAppSelector } from '@/redux/useAppSelector';
import React, { useState } from 'react';
import { getAllUsersApiCall } from './action';
import { useDispatch } from 'react-redux';


const UserList = () => {

  const dispatch = useDispatch();
  const { users } = useAppSelector((state) => state.usersReducer);
  const [loading, setLoading] = useState(false)

  React.useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        await getAllUsersApiCall(dispatch);
      } catch (err) {
        console.error("Failed to fetch users", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);


  return (
    <Grid container>
      <Grid size={{ xs: 12 }}>
        <UserListTable tableData={users} loading={loading} />
      </Grid>
    </Grid>
  )
}

export default UserList
