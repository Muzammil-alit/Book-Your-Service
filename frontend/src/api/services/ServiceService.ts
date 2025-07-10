import { FetchWrapper } from "../fetchWrapper";
import { ServiceDurationType, ServiceType } from "@/types/apps/servicesTypes";

export class ServiceService {

    async createService(service: ServiceType, durations?: ServiceDurationType[]) {
        // Format data according to backend DTO expectation
        const serviceData = {
            serviceName: service.serviceName,
            descr: service.descr,
            serviceDurationType: service.serviceDurationType,
            active: service.active,
            durations: durations
        };
        return FetchWrapper.post(`admin/services`, serviceData);
    }


    async getAllServices() {
        return FetchWrapper.get(`admin/services`);
    }

    
    async getServiceById(serviceID: number) {
        return FetchWrapper.get(`admin/services/${serviceID}`);
    }

    async getServiceLookupList() {
        return FetchWrapper.get(`admin/services/getLookupList`);
    }

    async updateServiceByID(serviceID: number, service: ServiceType) {
        const serviceData = {
            serviceName: service.serviceName,
            descr: service.descr,
            active: service.active,
            serviceDurationType: service.serviceDurationType,
            durations: service.durations || [],
            updatedOn: service.updatedOn
        };

        return FetchWrapper.put(`admin/services/${serviceID}`, serviceData);
    }

    async deleteServiceByID(serviceID: number) {
        return FetchWrapper.delete(`admin/services/${serviceID}`);
    }

    async getServiceCarers(serviceID: number) {
        return FetchWrapper.get(`admin/services/${serviceID}/carers`);
    }

    async updateServiceCarers(serviceID: number, carerIDs: number[]) {
        return FetchWrapper.post(`admin/services/updateServiceCarers`, { serviceID, carerIDs });
    }
    
    async getServiceDurations(serviceID: number) {
        return FetchWrapper.get(`admin/services/${serviceID}/durations`);
    }
}
