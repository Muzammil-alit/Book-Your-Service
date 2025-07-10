'use client'

import { ApiResponse } from "./types/apiTypes";

export class FetchWrapper {

  private static API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  private static getAuthToken(): string | null {
    if (typeof window !== 'undefined') {
      if (sessionStorage.getItem('userType') === '1') {
        return localStorage.getItem('adminToken');
      }

      else if (sessionStorage.getItem('userType') === '2') {
        return localStorage.getItem('clientToken');
      }
      
      else if (sessionStorage.getItem('userType') === '3') {
        return localStorage.getItem('carerToken');
      }

      else return null
    }
    return null;
  }

  private static authHeader(): HeadersInit {
    const token = this.getAuthToken();
    return token
      ? { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
      : { "Content-Type": "application/json" };
  }

  private static authHeaderWithTokenOnly(): HeadersInit {
    const token = this.getAuthToken();
    return token
      ? { Authorization: `Bearer ${token}` }
      : {};
  }

  private static async handleResponse(
    response: Response,
    noResponseData = false
  ): Promise<ApiResponse> {
    if (!response.ok) {
      return {
        isOk: false,
        data: await response.json(),
        statusCode: response.status,
      };
    } else {
      if (noResponseData) {
        return {
          isOk: true,
          data: { message: response.text() },
          statusCode: response.status,
        };
      }
      return {
        isOk: true,
        data: await response.json(),
        statusCode: response.status,
      };
    }
  }

  static async get(endpoint: string): Promise<ApiResponse> {
    const url = `${this.API_BASE_URL}/${endpoint}`;
    const response = await fetch(url, { method: "GET", headers: this.authHeader() });
    return this.handleResponse(response);
  }

  static async post(endpoint: string, body: Record<string, unknown>): Promise<ApiResponse> {
    const url = `${this.API_BASE_URL}/${endpoint}`;
    const response = await fetch(url, {
      method: "POST",
      headers: this.authHeader(),
      body: JSON.stringify(body),
    });
    return this.handleResponse(response);
  }

  // Post Request With Header and For File Attachment
  static async postwithFile(endpoint: string, body: FormData): Promise<ApiResponse> {
    const url = `${this.API_BASE_URL}/${endpoint}`;
    const response = await fetch(url, {
      method: "POST",
      headers: this.authHeaderWithTokenOnly(),
      body: body,
    });
    return this.handleResponse(response);
  }

  static async put(endpoint: string, body: Record<string, unknown>): Promise<ApiResponse> {
    const url = `${this.API_BASE_URL}/${endpoint}`;
    const response = await fetch(url, {
      method: "PUT",
      headers: this.authHeader(),
      body: JSON.stringify(body),
    });
    return this.handleResponse(response);
  }

  static async putwithFile(endpoint: string, body: FormData): Promise<ApiResponse> {
    const url = `${this.API_BASE_URL}/${endpoint}`;
    const response = await fetch(url, {
      method: "PUT",
      headers: this.authHeaderWithTokenOnly(),
      body: body,
    });
    return this.handleResponse(response);
  }

  static async delete(endpoint: string, body?: Record<string, unknown>): Promise<ApiResponse> {
    const url = `${this.API_BASE_URL}/${endpoint}`;
    const options: RequestInit = {
      method: "DELETE",
      headers: this.authHeader()
    };

    // Add body if provided
    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);
    return this.handleResponse(response, !body); // Only use noResponseData if no body was sent
  }

}
