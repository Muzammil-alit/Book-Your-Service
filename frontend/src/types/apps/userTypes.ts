

export type UserType = {
  userID?: number;
  firstName: string;
  password?: string | null | undefined;
  confirmPassword?: string;
  lastName: string;
  emailID: string;
  active: boolean;
  userType?: number;
  loading?: boolean
  updatedOn?: string;
  updatePassword?: boolean;
  phoneNumber?: string;
  ClientID?: number | null;
  UserID?: any
  UpdatedOn?: any
  status?: string
}
