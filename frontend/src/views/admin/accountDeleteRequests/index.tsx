import Grid from "@mui/material/Grid2";
import React from "react";
import { getAccountDeleteRequestsApiCall } from "./action";
import dayjs from "dayjs";
import AccountDeleteRequests from "./AccountDeleteList";
import { useState } from "react";
import { toast } from "react-toastify";
// import { getAllUsersApiCall } from "../user/action";

interface Filters {
    userID: string;
    dateFrom: string;
    dateTo: string;
}

const AccountDeleteRequest = () => {


    const [tableData, setTableData] = useState([])
    const [loading, setLoading] = useState(false)

    const today = dayjs().utc();

    const [filters, setFilters] = React.useState<Filters>({
        userID: "",
        dateFrom: today.subtract(0, 'week').startOf('week').toISOString(),
        dateTo: today.subtract(0, 'week').endOf('week').toISOString(),
    });





    const [isFirstLoad, setIsFirstLoad] = useState(true);

    const fetchTableData = async () => {


        const filtersToPost = {
            dateFrom: filters.dateFrom && filters.dateFrom.length ? filters.dateFrom : null,
            dateTo: filters.dateTo && filters.dateTo ? filters.dateTo : null,
            deleteStatus: (Number(filters.userID) == -1 || filters.userID.length == 0) ? null : Number(filters.userID)
        }



        try {

            if (isFirstLoad) {
                setLoading(true);
            }

            const res = await getAccountDeleteRequestsApiCall(
                filtersToPost.deleteStatus,
                filtersToPost.dateFrom,
                filtersToPost.dateTo,
            );
            setTableData(res)

            if (isFirstLoad) {
                setIsFirstLoad(false);
            }
        }
        catch (err) {
            toast.error('Unable to fetch delete requests')
        }
        finally {
            setLoading(false)
        }
    }



    React.useEffect(() => {

        fetchTableData()

    }, [filters]);



    return (
        <>
            <Grid container>
                <Grid size={{ xs: 12 }}>
                    <AccountDeleteRequests tableData={tableData} filters={filters} setFilters={setFilters} fetchTableData={fetchTableData} loading={loading} />
                </Grid>
            </Grid>
        </>
    )
}

export default AccountDeleteRequest;
