
import { ClientService } from "@/api/services/ClientService";
import { toast } from "react-toastify";

const clientService = new ClientService();

export const getClientList = async ( ) => {
    try {
        const response = await clientService.getClientList(null);
        if (!response.isOk) {
            const errorMessage = response.data.message as string;
            toast.error(errorMessage || "Unable to fetch users");
        } else {
            return response.data.data
        }
    } catch (error: unknown) {
        if (error instanceof Error) {
            toast.error(error?.message || "Something went wrong");
        } else {
            toast.error("Something went wrong");
        }
    }
}
