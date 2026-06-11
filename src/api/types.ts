export interface ApiResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
}

export function ok<T>(data: T): ApiResult<T> {
  return { success: true, data };
}

export function err<T>(error: string, code?: string): ApiResult<T> {
  return { success: false, error, code };
}
