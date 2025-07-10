export type RosterType = {
  BookingID: number;
  BookingDateTime: string; // e.g., "2025-06-02T11:00:00" (ISO format)
  ClientName: string;
  ServiceID: number;
  ServiceName: string;
  CarerName: string;
  Duration: number; // in hours
  StartTime?: string; // Derived from ActualStartDateTime if needed
  EndTime?: string; // Derived from ActualEndDateTime if needed
  Descr?: string; // Description if available
  BookingStatus: number;
  CancellationReason: string | null;
  CompletionStatus: number; // 1 = Full Shift, 2 = Adjusted, 101 = Cancelled
  ActualStartDateTime?: string | null; // Full datetime string
  ActualEndDateTime?: string | null; // Full datetime string
  CarerNotes: string | null;
  CreatedByUserName: string;
  CreatedOn: string; // ISO datetime string
  UpdatedByUserName?: string;
  UpdatedOn?: string; // ISO datetime string
};