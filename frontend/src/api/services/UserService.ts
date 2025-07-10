import { FetchWrapper } from "../fetchWrapper";

export class UserService {

    async createUser(data: Record<string, unknown>) {
        return FetchWrapper.post(`admin/users`, data);
    }

    async getAllUsers() {
        return FetchWrapper.get(`admin/users`);
    }

    async getUserByID(userID: number) {
        return FetchWrapper.get(`admin/users/${userID}}`);
    }

    async updateUserByID(userID: number, data: Record<string, unknown>) {
        return FetchWrapper.put(`admin/users/${userID}`, data);
    }

    async changePassByEmail(data: Record<string, unknown>) {
        return FetchWrapper.post(`admin/users/change-password`, data);
    }

    async deleteUserByID(userID: number) {
        return FetchWrapper.delete(`admin/users/${userID}`);
    }

    async getUserById(userID: number) {
        return FetchWrapper.get(`admin/users/${userID}`);
    }
}


