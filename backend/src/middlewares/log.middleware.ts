import { Request, Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../utils/AuthenticatedRequest";
import { UserRepository } from "../repositories/user.repository";

import { ActivityLogRepository } from "../repositories/activityLog.repository";

const userRepository = new UserRepository();
const activityLogRepository = new ActivityLogRepository();


export const logMiddleware = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    // Save original `res.send`
    const originalSend = res.send.bind(res);
    // Override `res.send` to capture response status & errors
    res.send = function (data: any): Response {
        // Immediately send the response
        const result = originalSend(data);

        // Process logging asynchronously without blocking
        processLogAsync(req, res, data).catch(err => {
            console.error("Error processing log:", err);
        });

        return result;
    };

    next();
};

async function processLogAsync(req: Request, res: Response, data: any) {
    const loggedInUser = (req as AuthenticatedRequest).user;
    let fullName: string | null = null;

    if (loggedInUser) {
        try {
            const user = await userRepository.findById(loggedInUser.userID);
            fullName = `${user?.FirstName || ''}${user?.LastName ? " " + user.LastName : ""}`;
        } catch (error) {
            console.error("Error fetching user:", error);
        }
    }

    const logData = {
        createdOn: new Date(),
        createdBy: loggedInUser?.userID || null,
        createdByName: fullName || null,
        route: req.originalUrl,
        method: req.method,
        description: generateDescription(req.method, req.originalUrl),
        parameters: {
            body: req.body,
            query: req.query,
            params: req.params,
        },
        response: {
            statusCode: res.statusCode,
            successMessage: "",
            errorMessage: ""
        },
    };

    if (res.statusCode >= 400) {
        let errorMessage = "";
        try {
            errorMessage = typeof data === "string"
                ? (JSON.parse(data)?.message || data)
                : (data?.message || JSON.stringify(data));
        } catch (e) {
            errorMessage = typeof data === "string" ? data : JSON.stringify(data);
        }
        logData.response.errorMessage = errorMessage;
    } else {
        let successMessage = "";
        try {
            successMessage = typeof data === "string"
                ? (JSON.parse(data)?.message || data)
                : (data?.message || JSON.stringify(data));
        } catch (e) {
            successMessage = typeof data === "string" ? data : JSON.stringify(data);
        }
        logData.response.successMessage = successMessage;
    }


    try {
        // Insert log into the database
        await activityLogRepository.insertActivityLog({
            route: logData.route,
            method: logData.method,
            description: logData.description,
            parameters: JSON.stringify(logData.parameters),
            response: JSON.stringify(logData.response),
            operatingUserID: logData.createdBy || 0
        });

    }
    catch (error) {
        console.error("Error inserting activity log:", error);
    }
}



    const generateDescription = (method: string, path: string) => {
        if (path.includes("api/auth")) return "User Login Attempt";

        else if (path.includes("api/admin/users")) {
            if (path.includes("/lookup")) return "Viewed Users List";
            if (path.includes("/change-password")) return "Changed User Password";
            if (path.match(/\/\d+$/) && method === "GET") return "Viewed Specific User Details";

            if (method === "GET") return "Viewed Users List";
            if (method === "POST") return "Created Admin User";
            if (method === "PUT" || method === "PATCH") return "Updated Admin User";
            if (method === "DELETE") return "Deleted Admin User";
            return "Performed action on Users";
        }
        else if (path.includes("api/admin/services")) {
            if (path.includes("getLookupList")) return "Viewed Service Lookup List";
            if (path.includes("updateServiceCarers")) return "Updated Service Carers";
            if (path.match(/\/view\/\d+$/)) return "Viewed Specific Service Details";
            if (path.match(/\/\d+\/carers$/)) return "Viewed Carers Assigned to Service";


            if (method === "GET") return "Viewed Admin Services";
            if (method === "POST") return "Created Admin Service";
            if (method === "PUT" || method === "PATCH") return "Updated Admin Service";
            if (method === "DELETE") return "Deleted Admin Service";
            return "Performed action on Services";
        }
        else if (path.includes("api/admin/carers")) {
            // if (path.includes("getLookupList")) return "Viewed Carer Lookup List";
            if (path.includes("updateCarerServices")) return "Updated Carer Services";
            if (path.match(/\/\d+\/services$/)) return "Viewed Services Assigned to Carer";
            if (path.match(/\/\d+$/) && method === "GET") return "Viewed Specific Carer Details";

            if (method === "GET") return "Viewed Admin Carers";
            if (method === "POST") return "Created Admin Carer";
            if (method === "PUT" || method === "PATCH") return "Updated Admin Carer";
            if (method === "DELETE") return "Deleted Admin Carer";

            return "Performed action on Carers";
        }
        else if (path.includes("api/admin/carer-schedule")) {
            if (method === "GET" && path.match(/\/\d+$/)) return "Viewed Carer Weekly Schedule";
            if (method === "POST" && path.match(/\/\d+$/)) return "Updated Carer Weekly Schedule";
            if (method === "DELETE" && path.match(/\/\d+\/[a-zA-Z]+$/)) return "Deleted Carer Schedule for a Weekday";

            return "Performed action on Carer Schedule";
        }
        else if (path.includes("api/admin/carerOffDays")) {
            if (method === "GET" && path.match(/\/\d+$/)) return "Viewed Carer Off Days";
            if (method === "POST" && path.includes("/create")) return "Created Carer Off Days";
            if (method === "PUT" && path.includes("/updateById")) return "Updated Carer Off Day by ID";
            if (method === "PUT" && path.includes("/updateCalendar")) return "Updated Carer Off Days via Calendar";
            if (method === "DELETE" && path.includes("/delete")) return "Deleted Carer Off Day";

            return "Performed action on Carer Off Days";
        }
        else if (path.includes("api/admin/deleteRequests")) {
            if (method === "POST" && path === "/api/admin/deleteRequests") return "Viewed Delete Requests";
            if (method === "GET" && path.match(/\/\d+$/)) return "Viewed Specific Delete Request by ID";
            if (method === "GET" && path.includes("/client/")) return "Viewed Delete Request by Client ID";
            if (method === "PUT" && path.match(/\/\d+\/status$/)) return "Updated Delete Request Status";

            return "Performed action on Admin Delete Requests";
        }
        else if (path.includes("api/client/booking")) {
            if (method === "GET" && path.includes("/services")) return "Viewed Available Services";
            if (method === "POST" && path.includes("/dates")) return "Requested Available Booking Dates";
            if (method === "POST" && path.includes("/timeslots")) return "Requested Available Timeslots";
            if (method === "POST" && path.includes("/carer")) return "View available Carers";
            if (method === "POST" && path.includes("/confirm")) return "Confirmed Booking";

            if (method === "GET" && path.match(/\/mybookings\/\d+$/)) return "Client Viewed Their Bookings";
            if (method === "PUT" && path.match(/\/updatebooking\/\d+$/)) return "Client Updated Their Booking";
            if (method === "DELETE" && path.match(/\/deletebooking\/\d+$/)) return "Client Deleted a Booking";

            return "Performed action on Client Booking";
        }
        else if (path.includes("api/admin/calendar")) {
            if (method === "POST" && path.includes("/getAdminRoster")) return "Viewed Roster List";
            if (method === "POST" && path.includes("/calendar")) return "Viewed Admin Calendar";
            if (method === "PUT" && path.includes("/updateCompletionStatus")) return "Updated Booking Completion Status";
            if (method === "GET" && path.includes("/getClientList")) return "Viewed Client Lookup List for Calendar";

            return "Performed action on Admin Calendar";
        }
        else if (path.includes("api/admin/activityLogs")) {
            return "Viewed Activity Logs";
        }
        else if (path.includes("api/admin/dashboard/getDashboardHeader")) {
            return "Viewed Admin Dashboard";
        }
        else if (path.includes("api/client/mybookings")) {
            if (method === "GET" && path.match(/\/\d+$/)) return "Client Viewed Booking List";
            if (method === "POST" && path.includes("/allbookings")) return "Client Viewed All Bookings";
            if (method === "PUT" && path.match(/\/\d+$/)) return "Client Updated a Booking";
            if (method === "DELETE" && path.match(/\/\d+$/)) return "Client Deleted a Booking";
            if (method === "GET" && path.includes("/getbooking/")) return "Client Viewed Booking Details";

            return "Performed action on Client My Bookings";
        }
        else if (path.includes("api/client") && !path.includes("booking") && !path.includes("mybookings") && !path.includes("deleteRequests")) {
            if (method === "GET" && path.includes("/getClientList/")) return "Viewed Client List";
            if (method === "GET" && path.match(/\/\d+$/)) return "Viewed Client Details";
            if (method === "PUT" && path.match(/\/\d+$/)) return "Updated Client Details";

            return "Performed action on Client Profile";
        }
    };
