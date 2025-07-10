'use client'

import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { AuthService } from "@/api/services/AuthService";
import { toast } from "react-toastify";

const authService = new AuthService();

export interface RegisterAttributes {
  firstName: string;
  lastName: string;
  emailID: string;
  phoneNo: string;
  password: string;
  subscribeNewsletter?: string;
  agreePolicy?: boolean | string;
}


export interface ClientSignupAttributes extends RegisterAttributes {
  
}


export const registerAction = async (
  values: RegisterAttributes, 
  router: AppRouterInstance, 
  userType: 'admin' | 'client' = 'client'
) => {
  const { firstName, lastName, emailID, phoneNo, password, subscribeNewsletter } = values;
  
  const dataToSend = {
    firstName,
    lastName,
    emailID,
    phoneNo,
    password,
    subscribeNewsletter: Boolean(subscribeNewsletter),
    userType
  };
  
  try {
  
      const clientData = values as ClientSignupAttributes;
      
      const clientDataToSend = {
        ...dataToSend,
        agreePolicy: Boolean(clientData.agreePolicy)
      };
      
      let response = await authService.clientSignup(clientDataToSend);
    
    
    if (!response.isOk) {

      
      const errorMessage = response.data.message as string;
      toast.error(errorMessage || "Registration failed");
      return false;
    } else {
      toast.success('Registration successful! Please login to continue.');
      
      // Redirect to login page based on user type
      if (userType === 'admin') {
        router.push("/admin/login");
      } else {
        router.push("/client/login");
      }
      return true;
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      toast.error(error?.message || "Registration failed");
    } else {
      toast.error("Registration failed. Please try again later.");
    }
    return false;
  }
} 