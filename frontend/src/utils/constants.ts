// User related types
export interface UserAttributes {
  userID: number;
  firstName: string;
  lastName?: string;
  emailID: string;
  userType: number;
  clientID?: number | null;
  carerID?: number | null;
  phoneNumber?: string;
  clientPhoneNo?: string;
}

export interface LoginAttributes {
  emailID: string;
  password: string;
}

export interface RegisterAttributes {
  firstName: string;
  lastName: string;
  emailID: string;
  phoneNo: string;
  password: string;
  subscribeNewsletter?: string;
}

// User types
export enum UserTypes {
  ADMIN = 1,
  CLIENT = 2,
  CARER = 3
} 