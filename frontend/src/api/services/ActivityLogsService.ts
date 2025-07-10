import { FetchWrapper } from "../fetchWrapper";

export class ActivityLogsService {


    async getAllActivityLogs(queryString: string) {
        return FetchWrapper.get(`admin/activityLogs${queryString}`);
    }

}
