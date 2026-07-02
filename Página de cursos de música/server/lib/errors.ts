export type ApiErrorCode =
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "COURSE_NOT_FOUND"
  | "MODULE_NOT_FOUND"
  | "MODULE_INCOMPLETE"
  | "INVALID_BODY"
  | "INVALID_SLOT_ORDER"
  | "INVALID_TITLE"
  | "VALIDATION_ERROR"
  | "INVALID_NODE"
  | "INVALID_ATTEMPT"
  | "SESSION_NOT_FOUND"
  | "SESSION_EXPIRED"
  | "SESSION_NOT_STARTABLE"
  | "EMAIL_TAKEN"
  | "INVALID_CREDENTIALS"
  | "WEAK_PASSWORD"
  | "INTERNAL_ERROR";

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: ApiErrorCode,
    message: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function errorBody(code: ApiErrorCode, message: string) {
  return { error: { code, message } };
}
