import { FetchWrapper } from "../fetchWrapper";

export class AdminDashboardService {
    async getDashboardHeader() {
        return FetchWrapper.get(`admin/dashboard/getDashboardHeader`);
    }

    async getDashboardActiveCarers() {
        return FetchWrapper.get(`admin/dashboard/getDashboardActiveCarers`);
    }

    async getDashboardInactiveCarers() {
        return FetchWrapper.get(`admin/dashboard/getDashboardInactiveCarers`);
    }

    async getDashboardMonthlyBookings(dateFrom: any, dateTo: any) {
        return FetchWrapper.post(`admin/dashboard/getDashboardMonthlyBookings`, { dateFrom, dateTo });
    }

    async getDashboardMonthlyBookingsPerService(dateFrom: any, dateTo: any) {
        return FetchWrapper.post(`admin/dashboard/getDashboardMonthlyBookingsPerService`, { dateFrom, dateTo });
    }

    async getDashboardMonthlyBookingsPerCarer(dateFrom: any, dateTo: any) {
        return FetchWrapper.post(`admin/dashboard/getDashboardMonthlyBookingsPerCarer`, { dateFrom, dateTo });
    }
    
    async getDashboardNotifications() {
        return FetchWrapper.get(`admin/dashboard/getDashboardNotifications`);
    }
}


