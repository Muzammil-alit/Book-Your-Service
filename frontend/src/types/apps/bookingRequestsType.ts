export type BookingRequestType = {
  BookingID: number;
  BookingDateTime: string; // e.g., "2025-06-02 11:00:00"
  ClientName: string;
  ServiceID: number;
  ServiceName: string;
  CarerName: string;
  Duration: number; // in hours?
  EndTime: string; // e.g., "12:00:00"
  Descr: string;
  BookingStatus: number;
  CancellationReason: string | null;
  CompletionStatus: number;
  ActualStartDateTime?: string | null;
  ActualEndDateTime?: string | null;
  CarerNotes: string | null;
  CreatedByUserName: string;
  CreatedOn: string;
  UpdatedByUserName?: string;
  UpdatedOn?: string;
  BookingType?: any
  StartTime?: any;
};
