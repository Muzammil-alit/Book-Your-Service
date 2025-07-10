export const fkConstraintList: string[] = [
  'FK_AccountDeleteRequest_CreatedBy',
  'FK_AccountDeleteRequest_UpdatedBy',
  'FK_Booking_CreatedBy',
  'FK_Booking_UpdatedBy',
  'FK_BookingLog_CreatedBy',
  'FK_carer_CreatedBy',
  'FK_carer_UpdatedBy',
  'FK_Carer_User',
  'FK_CarerOffDay_CreatedBy',
  'FK_CarerOffDay_UpdatedBy',
  'FK_Client_CreatedBy',
  'FK_Client_UpdatedBy',
  'FK_Client_User',
  'FK_RecurringBooking_CreatedBy',
  'FK_RecurringBooking_UpdatedBy',
  'FK_Service_CreatedBy',
  'FK_Service_UpdatedBy',
  'FK_Booking_Service',
  'FK_CarerService_Service',
  'FK_RecurringBooking_Service',
  'FK_ServiceDuration_ServiceID',
  'FK_Booking_Carer',
  'FK_CarerOffDay_Carer',
  'FK_CarerService_Carer',
  'FK_RecurringBooking_Carer',
  'FK_AccountDeleteRequest_Client',
  'FK_Booking_Client',
  'FK_RecurringBooking_Client',
];

export const ukConstraintMessageMap: Record<string, string> = {
  'UK_User_EmailID': 'Email ID already exists.',
  'UK_Carer_CarerName': 'Carer name already exists.',
  'UK_Service_ServiceName': 'Service name already exists.',
  'UK_Client_User': 'Client is already added to a user.',
};

export const ckConstraintList: string[] = [
  'CK_CarerOffDay_DateTo'
]

export enum eModuleName {
  user = 0,
  carer = 1,
  carerOffDays = 2,
  carerSchedule = 3,
  service = 4,
  client = 5,
  booking = 6,
  calendar = 7,
  roster = 8,
  dashboard = 9,
  login = 10,
  accountDeleteRequest = 11,
  activityLog = 12,
}
