import { FetchWrapper } from "../fetchWrapper";

export class ClientService {

    
    async getClientList(clientID: any) {
        return FetchWrapper.get(`client/getClientList/${clientID}`);
    }


    async getClientByID(clientID: number) {
        return FetchWrapper.get(`client/${clientID}`);
    }
    async updateClientByID(clientID: number, data: any) {
        return FetchWrapper.put(`client/${clientID}`, data);
    }
    
    async deleteAccount(clientID: any, loggedInUserID: any, reason: any) {
        return FetchWrapper.post(`client/deleteRequests`, {clientID, loggedInUserID, reason});
    }
}
