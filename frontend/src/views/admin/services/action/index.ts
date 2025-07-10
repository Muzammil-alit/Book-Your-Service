import { AppDispatch } from "@/redux/store";
import { loaderListener, successServiceReducer } from "@/redux/slices/services";
import { toast } from "react-toastify";
import { ServiceType, ServiceDurationType } from "@/types/apps/servicesTypes";
import { ServiceService } from "@/api/services/ServiceService";
import { CarerService } from "@/api/services/CarerService";
import { successCarerReducer } from "@/redux/slices/carers";

const serviceService = new ServiceService();
const carerService = new CarerService

export const getAllServicesApiCall = async (dispatch: AppDispatch) => {
    dispatch(
        loaderListener({
            loading: true,
        })
    )
    try {
        const response = await serviceService.getAllServices();
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


export const getServiceByIdApiCall = async (serviceID: number, cb: () => void) => {
    try {
        const response = await serviceService.getServiceById(serviceID);
        if (!response.isOk) {
            const errorMessage = response.data.message as string;
            toast.error(errorMessage || "Unable to update service");
        } else {
            toast.success('Service updated successfully');
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



export const createServiceApiCall = async (
    service: ServiceType, 
    durations: ServiceDurationType[], 
    dispatch: AppDispatch, 
    cb: (arg: ServiceType | Record<string, unknown>) => void
) => {
    dispatch(
        loaderListener({
            loading: true,
        })
    );
    
    try {
        const serviceResponse = await serviceService.createService(service, durations);
        if (!serviceResponse.isOk) {
            const errorMessage = serviceResponse.data.message as string;
            toast.error(errorMessage || "Unable to add service");
            return;
        }
        
        const newServiceData = serviceResponse.data.data;
        
        toast.success('Service created successfully');
        cb(newServiceData as ServiceType);
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

export const updateServiceApiCall = async (
    service: ServiceType, 
    durations: ServiceDurationType[], 
    serviceID: any,
    dispatch: AppDispatch, 
    cb: () => void
) => {
    dispatch(
        loaderListener({
            loading: true,
        })
    );
    
    try {
        // Include durations in the service update request
        const serviceData = {
            ...service,
            durations: service?.serviceDurationType === false ? durations : []
        };
        
        // Update the service with durations included
        

        const serviceResponse = await serviceService.updateServiceByID(serviceID, serviceData);
        if (!serviceResponse.isOk) {
            const errorMessage = serviceResponse.data.message as string;
            toast.error(errorMessage || "Unable to update service");
            return;
        }
        
        toast.success('Service updated successfully');
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

export const deleteServiceApiCall = async (serviceID: number, cb: () => void) => {
    try {
        const response = await serviceService.deleteServiceByID(serviceID);
        if (!response.isOk) {
            const errorMessage = response.data.message as string;
            toast.error(errorMessage || "Unable to delete service");
        } else {
            toast.success('Service deleted successfully');
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


export const getCarerListApiCall = async (dispatch: AppDispatch) => {
    dispatch(
        loaderListener({
            loading: true,
        })
    )
    try {
        const response = await carerService.getCarerLookupList()
        if (!response.isOk) {
            const errorMessage = response.data.message as string;
            toast.error(errorMessage || "Unable to fetch services");
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

export const getServiceCarersApiCall = async (serviceID: number): Promise<number[]> => {
    try {
        const response = await serviceService.getServiceCarers(serviceID);
        if (!response.isOk) {
            const errorMessage = response.data.message as string;
            toast.error(errorMessage || "Unable to fetch service carers");
            return [];
        } else {
            return response.data.data.serviceCarers || [];
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

export const updateServiceCarersApiCall = async (serviceID: number, carerIDs: number[]): Promise<boolean> => {
    try {
        const response = await serviceService.updateServiceCarers(serviceID, carerIDs);
        if (!response.isOk) {
            const errorMessage = response.data.message as string;
            toast.error(errorMessage || "Unable to update service carers");
            return false;
        } else {
            toast.success('Carer assignments saved successfully');
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

