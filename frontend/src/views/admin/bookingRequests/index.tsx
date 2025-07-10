import Grid from "@mui/material/Grid2";
import React from "react";
import dayjs from "dayjs";
import BookingRequestsListTable from "./bookingList/BookingRequestsListTable";
// import { getAllUsersApiCall } from "../user/action";

interface Filters {
    userID: string;
    dateFrom: any;
    dateTo: any;
    bookingType: any
}

const BookingRequests = () => {



    const today = dayjs().utc();

    const [filters, setFilters] = React.useState<Filters>({
        userID: "",
        dateFrom: today.subtract(0, 'week').startOf('week').toISOString(),
        dateTo: today.subtract(0, 'week').endOf('week').toISOString(),
        bookingType: null
    });




    return (
        <>
            <Grid container>
                <Grid size={{ xs: 12 }}>
                    <BookingRequestsListTable filters={filters} setFilters={setFilters} />
                </Grid>
            </Grid>
        </>
    )
}

export default BookingRequests;
