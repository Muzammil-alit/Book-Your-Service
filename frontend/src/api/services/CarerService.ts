import { FetchWrapper } from "../fetchWrapper";

export class CarerService {

    async createCarer(data: FormData) {
        return FetchWrapper.postwithFile(`admin/carers`, data);
    }

    async getAllCarers() {
        return FetchWrapper.get(`admin/carers`);
    }

    async getCarerLookupList() {
        return FetchWrapper.get(`admin/carers/getLookupList`);
    }

    async getCarerById(carerID: number) {
        return FetchWrapper.get(`admin/carers/${carerID}`);
    }

    async updateCarerByID(carerID: number, data: FormData) {
        return FetchWrapper.putwithFile(`admin/carers/${carerID}`, data);
    }

    async deleteCarerByID(carerID: number) {
        return FetchWrapper.delete(`admin/carers/${carerID}`);
    }

    async getCarerServices(carerID: number) {
        return FetchWrapper.get(`admin/carers/${carerID}/services`);
    }

    async updateCarerServices(carerID: number, serviceIDs: number[]) {
        return FetchWrapper.post(`admin/carers/updateCarerServices`, { carerID, serviceIDs });
    }
}
