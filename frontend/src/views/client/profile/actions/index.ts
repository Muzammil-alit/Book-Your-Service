import { AppDispatch } from "@/redux/store";

import { loaderListener, successClientReducer } from "@/redux/slices/client";
import { toast } from "react-toastify";
import { ClientService } from "@/api/services/ClientService";

import { useAppSelector } from '@/redux/useAppSelector';

const clientService = new ClientService()




export const getClientApiCall = async (clientID: any) => {
    try {
        const response = await clientService.getClientByID(clientID);
        if (!response.isOk) {
            const errorMessage = response.data.message as string;
            toast.error(errorMessage || "Unable to fetch user data");
        }
        else {
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


export const updateClientApiCall = async (
    clientID: any,
    data: any,
    dispatch: AppDispatch,
    cb: () => void
) => {
    dispatch(
        loaderListener({
            loading: true,
        })
    );

    try {
        const clientData = {
            ...data,
        };


        const clientResponse = await clientService.updateClientByID(clientID, clientData);
        if (!clientResponse.isOk) {
            const errorMessage = clientResponse.data.message as string;
            toast.error(errorMessage || "Unable to update service");
            return;
        }

        toast.success('Client updated successfully');
        cb();
    } catch (error: unknown) {
        if (error instanceof Error) {
            toast.error(error?.message || "Something went wrong");
        } else {
            toast.error("Something went wrong");
        }
    } finally {
        dispatch(
            loaderListener({
                loading: false,
            })
        );
    }
}




export const deleteAccountApiCall = async (clientID: any, loggedInUserID: any, reason: any) => {
    try {
        const response = await clientService.deleteAccount(clientID, loggedInUserID, reason);
        if (!response.isOk) {
            const errorMessage = response.data.message as string;
            toast.error(errorMessage || "Account deleted successfully");
        }
        else {
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
