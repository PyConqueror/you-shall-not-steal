import type { ResponseModel } from "../types/entities";
import { RESPONSE_STATUS } from "../types/enum";

export function createSuccessResponse<TData>(
  data: TData,
  statusCode: number = 200,
): ResponseModel<TData> {
  return {
    status: RESPONSE_STATUS.SUCCESS,
    statusCode,
    data,
  };
}

export function createErrorResponse(
  message: string,
  code: string = "ERR_500",
  statusCode: number = 500,
  details: Record<string, unknown> = {},
): ResponseModel<null> {
  return {
    status: RESPONSE_STATUS.ERROR,
    statusCode,
    data: null,
    error: {
      code,
      message,
      details,
    },
  };
}
