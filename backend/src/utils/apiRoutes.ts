// src/constants/apiRoutes.ts
const API_ROUTES = {
  admin: {
    users: "/api/admin/users",
    services: "/api/admin/services",
    carers: "/api/admin/carers",
    activityLogs: "/api/admin/activityLogs",
    carerSchedule: "/api/admin/carer-schedule",
    carerOffDays: "/api/admin/carerOffDays",
    deleteRequests: "/api/admin/deleteRequests",
    calendar: "/api/admin/calendar",
    bookings: "/api/admin/bookings",
    dashboard: "/api/admin/dashboard",
  },
  auth: "/api/auth",
  client: {
    base: "/api/client",
    booking: "/api/client/booking",
    myBookings: "/api/client/mybookings",
    deleteRequests: "/api/client/deleteRequests",
  }
};

export default API_ROUTES;