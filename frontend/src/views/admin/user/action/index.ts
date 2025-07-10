import { AppDispatch } from "@/redux/store";
import { UserService } from "@/api/services/UserService";
import { loaderListener, successUserReducer } from "@/redux/slices/users";
import { toast } from "react-toastify";
import { UserType } from "@/types/apps/userTypes";

const userService = new UserService();

export const getAllUsersApiCall = async (dispatch: AppDispatch) => {
    dispatch(
        loaderListener({
            loading: true,
        })
    )
    try {
        const response = await userService.getAllUsers();
        if (!response.isOk) {
            const errorMessage = response.data.message as string;
            toast.error(errorMessage || "Unable to fetch users");
        } else {
            dispatch(
                successUserReducer({
                    data: response.data.data,
                    loading: false,
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

export const createUserApiCall = async (values: UserType, dispatch: AppDispatch, cb: (arg: UserType | Record<string, unknown>) => void) => {
    dispatch(
        loaderListener({
            loading: true,
        })
    );
    const dataToSend = {
        ...values
    }
    try {
        const response = await userService.createUser(dataToSend);
        if (!response.isOk) {
            const errorMessage = response.data.message as string;
            toast.error(errorMessage || "Unable to add user");
        } else {
            toast.success('User created successfully');
            cb(response.data.data as UserType);
        }
    } catch (error: unknown) {
        if (error instanceof Error) {
            toast.error(error?.message || "Something went wrong");
        } else {
            toast.error("Something went wrong");
        }
    }
}

export const updateUserApiCall = async (values: UserType, dispatch: AppDispatch, cb: () => void) => {
    dispatch(
        loaderListener({
            loading: true,
        })
    );
    const dataToSend = {
        ...values
    }
    delete dataToSend.userID
    try {
        const response = await userService.updateUserByID(values.userID!, dataToSend);
        if (!response.isOk) {
            const errorMessage = response.data.message as string;
            toast.error(errorMessage || "Unable to update user");
        } else {
            toast.success('User updated successfully');
            cb();
        }
    } catch (error: unknown) {
        if (error instanceof Error) {
            toast.error(error?.message || "Something went wrong");
        } else {
            toast.error("Something went wrong");
        }
    }
}


export const changePassApiCall = async (values: any, dispatch: AppDispatch, cb: () => void) => {
    dispatch(
        loaderListener({
            loading: true,
        })
    );
    const dataToSend = {
        ...values
    }
    try {
        const response = await userService.changePassByEmail(dataToSend);
        if (!response.isOk) {
            const errorMessage = response.data.message as string;
            toast.error(errorMessage || "Unable to update user");
        } else {
            toast.success('Password updated successfully');
            cb();
        }
    } catch (error: unknown) {
        if (error instanceof Error) {
            toast.error(error?.message || "Something went wrong");
        } else {
            toast.error("Something went wrong");
        }
    }
}




export const getUserByIdApiCall = async (userID: number) => {
    try {
        const response = await userService.getUserById(userID);
        if (!response.isOk) {
            const errorMessage = response.data.message as string;
            toast.error(errorMessage || "Unable to fetch user");
        } else {
            return response?.data?.data?.user
        }
    } catch (error: unknown) {
        if (error instanceof Error) {
            toast.error(error?.message || "Something went wrong");
        } else {
            toast.error("Something went wrong");
        }
    }
}



export const deleteUserApiCall = async (userID: number, cb: () => void) => {
    try {
        const response = await userService.deleteUserByID(userID);
        if (!response.isOk) {
            const errorMessage = response.data.message as string;
            toast.error(errorMessage || "Unable to fetch user");
        } else {
            toast.success('User deleted successfully');
            cb();
        }
    } catch (error: unknown) {
        if (error instanceof Error) {
            toast.error(error?.message || "Something went wrong");
        } else {
            toast.error("Something went wrong");
        }
    }
}
