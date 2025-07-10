export type AccountDeleteRequestType = {
  AccountDeleteRequestID: number;
  RequestDateTime: string;
  ClientID: number;
  ClientName: string;
  Reason: string;
  DeleteStatus: number;
  CreatedByUserName: string;
  CreatedOn: string;
  UpdatedByUserName?: string;
  UpdatedOn?: string;
};
