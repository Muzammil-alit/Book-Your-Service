export type ActivityLogType = {
    createdOn: string;
    createdBy: number;
    createdByName: string;
    route: string;
    method: string;
    description: string;
    parameters: {
        body?: object;
        query?: object;
        params?: object;
    };
    response: {
        statusCode: number;
        successMessage?: string;
        errorMessage?: string;

    };
    statusCode: number;
}
