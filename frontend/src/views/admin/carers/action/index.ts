import { AppDispatch } from "@/redux/store";
import { loaderListener, successCarerReducer } from "@/redux/slices/carers";
import { toast } from "react-toastify";
import { CarerType } from "@/types/apps/carerTypes";
import { CarerService } from "@/api/services/CarerService";
import { ServiceService } from "@/api/services/ServiceService";
import { successServiceReducer } from "@/redux/slices/services";

const carerService = new CarerService();
const serviceService = new ServiceService();

export const getAllCarersApiCall = async (dispatch: AppDispatch) => {
    dispatch(
        loaderListener({
            loading: true,
        })
    )
    try {
        const response = await carerService.getAllCarers();
        if (!response.isOk) {
            const errorMessage = response.data.message as string;
            toast.error(errorMessage || "Unable to fetch carers");
        } else {
            dispatch(
                successCarerReducer({
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

export const createCarerApiCall = async (values: CarerType, dispatch: AppDispatch, cb: (arg: CarerType | Record<string, unknown>) => void) => {
    dispatch(
        loaderListener({
            loading: true,
        })
    );
    try {
        const formData = new FormData();
        formData.append("firstName", values.firstName)
        formData.append("lastName", values.lastName)
        formData.append("password", values.password)
        formData.append("emailID", values.emailID)
        formData.append("color", values.color);
        formData.append("active", values.active ? "true" : "false");
        formData.append("descr", values.descr);
        if (values.profilePic) {
            formData.append("profilePic", values.profilePic);
        }

        const response = await carerService.createCarer(formData);
        if (!response.isOk) {
            const errorMessage = response.data.message as string;
            toast.error(errorMessage || "Unable to add carer");
        } else {
            // If profile pic was uploaded, fetch the complete carer data to get the profile pic URL
            const data = response.data.data as { carerID?: number } & Record<string, unknown>;
            if (values.profilePic && data.carerID) {
                const carerID = data.carerID;
                const completeCarerData = await getCarerByIdApiCall(carerID);
                if (completeCarerData) {
                    cb({
                        ...data,
                        profilePic: completeCarerData.profilePic
                    });
                } else {
                    cb(data as CarerType);
                }
            } else {
                cb(data as CarerType);
            }
        }
    } catch (error: unknown) {
        if (error instanceof Error) {
            toast.error(error?.message || "Something went wrong");
        } else {
            toast.error("Something went wrong");
        }
    }
}

export const updateCarerApiCall = async (values: CarerType, isProfileChanged: boolean, dispatch: AppDispatch, updatePassword, updatedOn, userID, profilePicUrl, cb: (updatedCarer?: CarerType) => void) => {
    dispatch(
        loaderListener({
            loading: true,
        })
    );
    const formData = new FormData();
    // formData.append("carerID", values.carerID!.toString())

    formData.append("firstName", values.firstName)
    formData.append("lastName", values.lastName)
    formData.append("emailID", values.emailID)
    formData.append("color", values.color);
    formData.append("active", values.active ? "true" : "false");
    formData.append("descr", values.descr);
    formData.append("carerID", values.carerID);
    formData.append("updatePassword", updatePassword);
    formData.append("userID", userID);


    if (updatePassword) {
        formData.append("password", values.password ?? null)       
    }

    if (updatedOn) {
        formData.append("updatedOn", updatedOn);
    }




    // Handle profile pic changes
    if (isProfileChanged) {
        formData.append("updateProfilePic", 'true')
        if (values.profilePic instanceof File) {
            // A new file is being uploaded
            formData.append("profilePic", values.profilePic);
        } else if (values.profilePic === null) {
            // Profile pic is being explicitly removed
            formData.append("removeProfilePic", "true");
        }
    }
    else {
        formData.append("updateProfilePic", 'false')
    }


    try {        
        const response = await carerService.updateCarerByID(values.carerID!, formData);
        if (!response.isOk) {
            const errorMessage = response.data.message as string;
            toast.error(errorMessage || "Unable to update carer");
        } else {
            toast.success("Carer updated successfully");

            // Fetch the updated carer data to get the latest profile pic URL
            if (isProfileChanged) {
                const updatedCarer = await getCarerByIdApiCall(values.carerID!);
                cb(updatedCarer || undefined);
            } else {
                cb();
            }
        }
    } catch (error: unknown) {
        if (error instanceof Error) {
            toast.error(error?.message || "Something went wrong");
        } else {
            toast.error("Something went wrong");
        }
    }
}

export const deleteCarerApiCall = async (carerID: number, cb: () => void) => {
    try {
        const response = await carerService.deleteCarerByID(carerID);
        if (!response.isOk) {
            const errorMessage = response.data.message as string;
            toast.error(errorMessage || "Unable to delete carer");
        } else {
            toast.success("Carer deleted successfully");
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

export const getServiceListApiCall = async (dispatch: AppDispatch) => {
    dispatch(
        loaderListener({
            loading: true,
        })
    )
    try {
        const response = await serviceService.getServiceLookupList();
        if (!response.isOk) {
            const errorMessage = response.data.message as string;
            toast.error(errorMessage || "Unable to fetch services");
        } else {
            dispatch(
                successServiceReducer({
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

export const getCarerServicesApiCall = async (carerID: number): Promise<number[]> => {
    try {
        const response = await carerService.getCarerServices(carerID);
        if (!response.isOk) {
            const errorMessage = response.data.message as string;
            toast.error(errorMessage || "Unable to fetch carer services");
            return [];
        } else {
            return response.data.data.carerServices
        }
    } catch (error: unknown) {
        if (error instanceof Error) {
            toast.error(error?.message || "Something went wrong");
        } else {
            toast.error("Something went wrong");
        }
        return [];
    }
}

export const updateCarerServicesApiCall = async (carerID: number, serviceIDs: number[]): Promise<boolean> => {
    try {
        const response = await carerService.updateCarerServices(carerID, serviceIDs);
        if (!response.isOk) {
            const errorMessage = response.data.message as string;
            toast.error(errorMessage || "Unable to update carer services");
            return false;
        } else {
            toast.success('Service assignments saved successfully');
            return true;
        }
    } catch (error: unknown) {
        if (error instanceof Error) {
            toast.error(error?.message || "Something went wrong");
        } else {
            toast.error("Something went wrong");
        }
        return false;
    }
}

export const getCarerByIdApiCall = async (carerID: number): Promise<CarerType | null> => {
    try {
        const response = await carerService.getCarerById(carerID);
        if (!response.isOk) {
            const errorMessage = response.data.message as string;
            toast.error(errorMessage || "Unable to fetch carer details");
            return null;
        } else {
            return response.data.data.carer as CarerType;
        }
    } catch (error: unknown) {
        if (error instanceof Error) {
            toast.error(error?.message || "Something went wrong");
        } else {
            toast.error("Something went wrong");
        }
        return null;
    }
}
