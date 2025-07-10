import { FetchWrapper } from "../fetchWrapper";

export class AdminCalendarService {

    async getAdminCalendar(carerID: any, dateFrom: any, dateTo: any, bookingType?: number) {
        return FetchWrapper.post(`admin/calendar/calendar`, { carerID, dateFrom, dateTo, bookingType });
    }
    async getClientList() {
        return FetchWrapper.get(`admin/calendar/getClientList`);
    }
    async updateCompletionStatus(data: any) {
        return FetchWrapper.put(`admin/calendar/updateCompletionStatus`, data);
    }
    
    
    
    async getAdminRoster(data: any) {
        return FetchWrapper.post(`admin/calendar/getAdminRoster`, data);
    }
    

}
