
import { handleServiceError } from '../utils/handleDBError';
import { ActivityLogRepository } from '../repositories/activityLog.repository';




function transformActivityLogs(rawData) {


  const totalRecords = rawData["0"][0].TotalRecordCount;

  const logs = rawData["1"].map(log => ({
    parameters: {
      body: JSON.parse(log.Parameters).body || null,
      params: JSON.parse(log.Parameters).params || null,
      query: JSON.parse(log.Parameters).query || null
    },
    response: {
      statusCode: JSON.parse(log.Response).statusCode,
      successMessage: JSON.parse(log.Response).successMessage || "",
      errorMessage: JSON.parse(log.Response).errorMessage || ""
    },
    _id: log.ActivityLogID.toString(),
    createdOn: log.CreatedOn,
    createdBy: null,
    createdByName: log.CreatedByUserName,
    route: log.Route,
    method: log.Method,
    description: log.Description,
    __v: 0
  }));

  return {
    logs,
    totalRecords
  };
}



const activityLogRepository = new ActivityLogRepository();




export class ActivityLogService {


  async getActivityLogs(
    createdBy?: number,
    dateFrom?: string,
    dateTo?: string,
  ) {
    try {


      const fromDate = dateFrom ? new Date(`${dateFrom}T00:00:00.000Z`) : undefined;
      const toDate = dateTo ? new Date(`${dateFrom}T23:59:59.999Z`) : undefined;

      const result = await activityLogRepository.getActivityLogList({
        userID: createdBy,
        dateFrom: fromDate,
        dateTo: toDate
      })

      return transformActivityLogs(result);


    } catch (error: any) {
      handleServiceError(error, 'fetch activity logs');
      throw error;
    }
  }

}
