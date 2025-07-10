export interface ApiResponse {
    isOk: boolean;
    data: Record<string, unknown>,
    statusCode: number;
  }
