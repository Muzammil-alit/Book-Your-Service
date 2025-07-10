import { AppDispatch } from "@/redux/store";
import { loaderListener, successActivityLogsReducer } from "@/redux/slices/activitylogs";
import { toast } from "react-toastify";
import { ActivityLogsService } from "@/api/services/ActivityLogsService";

const activityLogsService = new ActivityLogsService();

export const getAllActivityLogsApiCall = async (dispatch: AppDispatch, queryString: string) => {
    dispatch(
        loaderListener({
            loading: true,
        })
    )
    try {
        const response = await activityLogsService.getAllActivityLogs(queryString);
        if (!response.isOk) {
            const errorMessage = response.data.message as string;
            toast.error(errorMessage || "Unable to fetch activity logs");
        } else {
            dispatch(
                successActivityLogsReducer({
                    data: response.data.data,
                    loading: false,
                    totalRecords: response.data.totalRecords,
                })
            );
        }
    } catch (error: unknown) {
        if (error instanceof Error) {
            toast.error(error?.message || "Something went wrong");
        } else {
            toast.error("Something went wrong");
        }
    }
}

