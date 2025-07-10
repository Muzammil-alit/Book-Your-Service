"use client";

import Grid from '@mui/material/Grid2'
import ServiceListTable from './ServiceListTable'
import { useAppSelector } from '@/redux/useAppSelector';
import React from 'react';
import { getAllServicesApiCall } from './action';
import { useDispatch } from 'react-redux';
import { useState } from 'react';

const Services = () => {

    const dispatch = useDispatch();
    const { services } = useAppSelector((state) => state.servicesReducer);
    const [loading, setLoading] = useState(false)

React.useEffect(() => {
    const fetchServices = async () => {
        setLoading(true);
        try {
            await getAllServicesApiCall(dispatch);
        } catch (err) {
            console.error("Failed to fetch services", err);
        } finally {
            setLoading(false);
        }
    };

    fetchServices();
}, []);

    

    return (
        <Grid container>
            <Grid size={{ xs: 12 }}>
                <ServiceListTable tableData={services} loading={loading} />
            </Grid>
        </Grid>
    )
}

export default Services
