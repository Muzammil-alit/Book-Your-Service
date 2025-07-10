import { FetchWrapper } from "../fetchWrapper";

export class AuthService {

    async login(data: Record<string, unknown>) {
        return FetchWrapper.post(`auth/login`, data);
    }

    async register(data: Record<string, unknown>) {
        return FetchWrapper.post(`auth/register`, data);
    }

    async clientSignup(data: Record<string, unknown>) {
        return FetchWrapper.post(`auth/client/signup`, data);
    }

    async generateResetPasswordCode(data: any) {
        return FetchWrapper.post(`auth/generateResetPasswordCode`, data);
    }


    async validateResetPasswordCode(data: Record<string, unknown>) {
        return await FetchWrapper.post(`auth/validateResetPasswordCode`, data);
    }

    async resetPassword(data: Record<string, unknown>) {
        return await FetchWrapper.post(`auth/resetPassword`, data);
    }



}
