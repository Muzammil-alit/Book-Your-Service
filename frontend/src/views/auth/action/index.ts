'use client'

import { AppDispatch } from "@/redux/store";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { LoginAttributes, UserAttributes } from "@/utils/constants";
import { AuthService } from "@/api/services/AuthService";
import { toast } from "react-toastify";
import { login } from "@/redux/slices/login";

import axios from 'axios';

interface AuthState {
    user: UserAttributes;
    token: string;
}

interface ResetPasswordResponse {
    isOk: boolean;
    data: {
        message?: string;
        data?: {
            ResetPasswordCode: string;
        };
    };
}

interface SecondApiResponse {
    // Define the expected response structure from your second API
    success: boolean;
    status?: boolean;
    message?: string;
}



const authService = new AuthService();

export const loginAction = async (values: LoginAttributes, router: AppRouterInstance, dispatch: AppDispatch, userType: number) => {
    const { emailID, password } = values
    const dataToSend = {
        emailID,
        password,
        userType // Pass user type to backend
    }
    try {
        const response = await authService.login(dataToSend);
        if (!response.isOk) {
            const errorMessage = response.data.message as string;
            toast.error(errorMessage.split(':')[1] || "Invalid Credentials");
        } else {

            toast.success('Login successful');
            const data = response.data.data as unknown as AuthState

            if (!data.user.userType) {
                data.user.userType = userType;
            }


            // convert to camelcase from pascalcase
            function toCamelCase(str: string) {
                return str[0].toLowerCase() + str.slice(1);
            }
            const camelUser = Object.fromEntries(
                Object.entries(data.user).map(([key, val]) => [toCamelCase(key), val])
            );

            const result = {
                token: data.token,
                user: camelUser as UserAttributes
            };


            dispatch(login({ data: result }));

            if (typeof window !== 'undefined') {
                if (data.user.userType === 1) {
                    localStorage.setItem('adminToken', data.token);
                    localStorage.setItem('adminLoggedIn', 'true');
                    sessionStorage.setItem('userType', '1');
                } else if (data.user.userType === 2) {
                    localStorage.setItem('clientToken', data.token);
                    localStorage.setItem('clientLoggedIn', 'true');
                    sessionStorage.setItem('userType', '2');
                } else if (data.user.userType === 3) {
                    localStorage.setItem('carerToken', data.token);
                    localStorage.setItem('carerLoggedIn', 'true');
                    sessionStorage.setItem('userType', '3');
                }
            }


            // Redirect based on user type
            if (data.user.userType === 1) {
                router.replace("/admin/dashboard");
            } else if (data.user.userType === 2) {
                router.replace("/client/dashboard");
            } else if (data.user.userType === 3) {
                router.replace("/carer/dashboard");
            }
        }
    } catch (error: unknown) {
        if (error instanceof Error) {
            toast.error(error?.message || "Invalid Credentials");
        } else {
            toast.error("Invalid Credentials");
        }
    }
}

export const logout = (router: AppRouterInstance) => {
    // Get user type before clearing localStorage
    const userType = parseInt(sessionStorage.getItem('userType') || '0')

    if (typeof window !== 'undefined') {
        localStorage.removeItem('nextauth.message')
        localStorage.removeItem('accessToken')
        localStorage.removeItem('v.1root')
    }

    toast.success('Logged out successfully');

    // Redirect based on previous user type
    if (userType === 1) {
        localStorage.removeItem('adminToken')
        localStorage.setItem('adminLoggedIn', 'false');
        sessionStorage.removeItem('userType')
        router.push("/admin/login");
    } else if (userType === 2) {
        localStorage.removeItem('clientToken')
        localStorage.setItem('clientLoggedIn', 'false');
        sessionStorage.removeItem('userType')
        router.push("/client/login");
    } else if (userType === 3) {
        localStorage.removeItem('carerToken')
        localStorage.setItem('carerLoggedIn', 'false');
        sessionStorage.removeItem('userType')
        router.push("/carer/login");
    } else {
        // Default fallback if userType is not set
        router.push("/client/login");
    }
}



export const generateResetPasswordCode = async (emailID: string): Promise<{ ResetPasswordCode: boolean | undefined } | null> => {
    try {
        // First API call - Get the reset code
        const response: ResetPasswordResponse = await authService.generateResetPasswordCode({ emailID: emailID });

        if (response.data.data && (response.data.data as any).success === false) {
            const errorMessage = (response.data.data as any).message as string;
            toast.error(errorMessage)
            return null

        }

        const resetCode = response?.data?.data?.data?.ResetPasswordCode as string | undefined;

        // Verify environment variable
        const forgotPasswordUrl = process.env.NEXT_PUBLIC_FORGOT_PASSWORD_URL;
        if (!forgotPasswordUrl) {
            toast.error("Forgot password endpoint URL is not configured in env");
            return null;
        }

        // Second API call - Send the reset code
        if (resetCode) {
            try {
                const secondApiResponse = await axios.post<SecondApiResponse>(
                    forgotPasswordUrl,
                    {
                        email: emailID,
                        reset_token: resetCode
                    },
                    {
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    }
                )

                if (secondApiResponse.data.status) {
                    return { ResetPasswordCode: true };
                }


            } catch (error) {
                return null;
            }
        }

        else {
            toast.error("Reset code not found");
            return null;
        }

    } catch (error: unknown) {
        return null;
    }
    return null;
};




export const validateResetPasswordCodeApiCall = async (resetCode: string) => {
    try {
        const response = await authService.validateResetPasswordCode({
            resetPasswordCode: resetCode
        });

        if (!response.isOk) {
            const errorMessage = response.data.message as string;
            toast.error(errorMessage.split(':')[1] || "Invalid reset code");
            return false;
        } else {

            toast.success("Reset code validated successfully");
            return true;
        }
    } catch (error: unknown) {
        if (error instanceof Error) {
            toast.error(error?.message || "Failed to validate reset code");
        } else {
            toast.error("Failed to validate reset code");
        }
        return false;
    }
}

export const resetPasswordApiCall = async (resetCode: string, newPassword: string) => {
    try {
        const response = await authService.resetPassword({
            resetPasswordCode: resetCode,
            newPassword: newPassword
        })

        if (!response.isOk) {
            const errorMessage = response.data.message as string;
            toast.error(errorMessage.split(':')[1] || "Failed to reset password");
            return false;
        } else {

            toast.success("Password reset successfully");
            return true;
        }
    } catch (error: unknown) {
        if (error instanceof Error) {
            toast.error(error?.message || "Failed to reset password");
        } else {
            toast.error("Failed to reset password");
        }
        return false;
    }
}


