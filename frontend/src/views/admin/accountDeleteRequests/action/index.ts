
import { toast } from "react-toastify";


import { AccountDeleteServices } from "@/api/services/AccountDeleteServices.service";

const accountDeleteServices = new AccountDeleteServices();

type AccountDeleteRequestsResponse = {
    isOk: boolean;
    data: {
        message?: string;
        data?: {
            requests?: any;
        };
    };
};

export const getAccountDeleteRequestsApiCall = async (status: any, dateFrom: any, dateTo: any) => {
    try {
        const response = await accountDeleteServices.getAccountDeleteRequests(status, dateFrom, dateTo) as AccountDeleteRequestsResponse;
        if (!response.isOk) {
            const errorMessage = response.data.message as string;
            toast.error(errorMessage || "Unable to fetch delete requests logs");
        } else {
            return response?.data?.data?.requests

        }
    } catch (error: unknown) {
        if (error instanceof Error) {
            toast.error(error?.message || "Something went wrong");
        } else {
            toast.error("Something went wrong");
        }
    }
}


export const updateAccountDeleteRequestApiCall= async (requestID: any, deleteStatus: any) => {
    try {
        const response = await accountDeleteServices.updateAccountDeleteRequest(requestID, deleteStatus);
        if (!response.isOk) {
            const errorMessage = response.data.message as string;
            toast.error(errorMessage || "Unable to fetch delete requests logs");
        } else {
            return response

        }
    } catch (error: unknown) {
        if (error instanceof Error) {
            toast.error(error?.message || "Something went wrong");
        } else {
            toast.error("Something went wrong");
        }
    }
}


