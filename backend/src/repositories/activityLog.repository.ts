import { eModuleName } from "../utils/dbConstraintMap";
import { executeStoredProcedure } from "../utils/ExecuteProcedureFn";
import { handleRepositoryError } from "../utils/handleDBError";

export class ActivityLogRepository {
    async insertActivityLog(
        data: {
            route: string;
            method: string;
            description: string | undefined;
            parameters: string;
            response: string;
            operatingUserID: number;
        }
    ): Promise<any> {
        try {
            const result = await executeStoredProcedure("ActivityLogInsert", {
                Route: data.route,
                Method: data.method,
                Description: data.description,
                Parameters: data.parameters,
                Response: data.response,
                OperatingUserID: data.operatingUserID
            });

            return result;
        } catch (error: any) {
            handleRepositoryError(error, eModuleName.activityLog);
        }
    }

    async getActivityLogList(filters: {
        userID?: number | null;
        dateFrom?: Date | null;
        dateTo?: Date | null;
    }): Promise<{
        totalRecordCount: number;
        logs: Array<{
            activityLogID: number;
            route: string;
            method: string;
            description: string;
            parameters: string;
            response: string;
            createdByUserName: string;
            createdOn: Date;
        }>;
    }> {
        try {
            const result = await executeStoredProcedure("GetActivityLogList", {
                UserID: filters.userID ?? null,
                DateFrom: filters.dateFrom ?? null,
                DateTo: filters.dateTo ?? null
            }, {}, {}, true);

            return result


        } catch (error: any) {
            handleRepositoryError(error, eModuleName.activityLog);
            throw error; 
        }
    }



}