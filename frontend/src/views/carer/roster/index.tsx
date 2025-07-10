'use client';

import Grid from "@mui/material/Grid2";
import React from "react";
import RosterListTable from "./RosterList";
import dayjs from "dayjs";

interface Filters {
    userID: string;
    dateFrom: string;
    dateTo: string;
}

const Roster = () => {


    const today = dayjs().utc();

    const [filters, setFilters] = React.useState<Filters>({
        userID: "",
        dateFrom: today.subtract(0, 'week').startOf('week').toISOString(),
        dateTo: today.subtract(0, 'week').endOf('week').toISOString(),
    });


    return (
        <>
            <Grid container>
                <Grid size={{ xs: 12 }}>
                    <RosterListTable filters={filters} setFilters={setFilters} />
                </Grid>
            </Grid>
        </>
    )
}

export default Roster;
