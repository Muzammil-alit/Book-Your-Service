'use client'


import Grid from "@mui/material/Grid2";
import ActivityLogListTable from "./ActivityLogsListTable";
import { useDispatch } from "react-redux";
import { useAppSelector } from "@/redux/useAppSelector";
import React from "react";
import { getAllActivityLogsApiCall } from "./action";
import dayjs from "dayjs";
import { getAllUsersApiCall } from "@/views/admin/user/action"
import { useState } from "react";

interface Filters {
    userID: string;
    dateFrom: string;
    dateTo: string;
}

const ActivityLogs = () => {

    const dispatch = useDispatch();
    const { logs, totalRecords } = useAppSelector((state) => state.activityLogsReducer);
    const { users } = useAppSelector((state) => state.usersReducer);

    const [loading, setLoading] = useState(false)


    const [filters, setFilters] = React.useState<Filters>({
        userID: "all",
        dateFrom: "",
        dateTo: "",
    });

    React.useEffect(() => {
        const { userID, dateFrom, dateTo } = filters;
        // Format dates to "YYYY-MM-DD"
        const formattedDateFrom = dateFrom ? dayjs(dateFrom).format("YYYY-MM-DD") : undefined;
        const formattedDateTo = dateTo ? dayjs(dateTo).format("YYYY-MM-DD") : undefined;

        const queryParams: Record<string, string> = {};

        if (userID) queryParams.userID = String(userID);
        if (formattedDateFrom && formattedDateTo) {
            queryParams.dateFrom = formattedDateFrom;
            queryParams.dateTo = formattedDateTo;
        }

        const queryString = new URLSearchParams(queryParams).toString();
        getAllActivityLogsApiCall(dispatch, `?${queryString}`);
    }, [filters]);

    React.useEffect(() => {
        async function fetch() {
            try {
                setLoading(true)
                const result = await getAllUsersApiCall(dispatch);
            }
            catch (err) {

            }
            finally {
                setLoading(false)
            }
        }
        fetch()
    }, [])

    React.useEffect(() => {
        const { userID, dateFrom, dateTo } = filters;
        // Format dates to "YYYY-MM-DD"
        const formattedDateFrom = dateFrom ? dayjs(dateFrom).format("YYYY-MM-DD") : undefined;
        const formattedDateTo = dateTo ? dayjs(dateTo).format("YYYY-MM-DD") : undefined;

        // Construct query params
        const queryParams: Record<string, string> = {};

        if (userID) queryParams.userID = String(userID);
        if (formattedDateFrom && formattedDateTo) {
            queryParams.dateFrom = formattedDateFrom;
            queryParams.dateTo = formattedDateTo;
        }

        // Build query string
        const queryString = new URLSearchParams(queryParams).toString();
    }, [filters]);

    return (
        <>
            <Grid container>
                <Grid size={{ xs: 12 }}>
                    <ActivityLogListTable tableData={logs} totalRecords={totalRecords} usersData={users} filters={filters} setFilters={setFilters} loading={loading} />
                </Grid>
            </Grid>
        </>
    )
}

export default ActivityLogs;
