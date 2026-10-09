export interface GenericResponse<T> {
  status: string;
  message: string | null;
  data?: T | null;
  errors?: unknown;
}

export const ResponseUtil = {
  success<T>(data: T | null, message: string): GenericResponse<T> {
    return { status: 'SUCCESS', message, data };
  },
  error<T = unknown>(message: string | null, errors: unknown): GenericResponse<T> {
    return { status: 'Errors', message, errors };
  },
};
