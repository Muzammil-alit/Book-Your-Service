import { FetchWrapper } from "../fetchWrapper";

export class AccountDeleteServices {


    async getAccountDeleteRequests(status: any, dateFrom: any, dateTo: any) {
        return FetchWrapper.post(`admin/deleteRequests`, {status, dateFrom, dateTo});
    }

    async updateAccountDeleteRequest(requestID: any, deleteStatus: any,) {
        return FetchWrapper.put(`admin/deleteRequests/${requestID}/status`, { deleteStatus});
    }

}
