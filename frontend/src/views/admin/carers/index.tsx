"use client";

import Grid from '@mui/material/Grid2'
import CarerListTable from './CarerListTable'
import { useAppSelector } from '@/redux/useAppSelector';
import React, { useState } from 'react';
import { getAllCarersApiCall } from './action';
import { useDispatch } from 'react-redux';

const Carers = () => {

    const dispatch = useDispatch();
    const { carers } = useAppSelector((state: any) => state.carersReducer);
    const [loading, setLoading] = useState(false)

    React.useEffect(() => {
        const fetchCarers = async () => {
            setLoading(true);
            try {
                await getAllCarersApiCall(dispatch);
            } catch (err) {
                console.error("Failed to fetch carers", err);
            } finally {
                setLoading(false);
            }
        };

        fetchCarers();
    }, []);

    return (
        <Grid container>
            <Grid size={{ xs: 12 }}>
                <CarerListTable tableData={carers} loading={loading}/>
            </Grid>
        </Grid>
    )
}

export default Carers
