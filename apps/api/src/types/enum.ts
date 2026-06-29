export const RESPONSE_STATUS = {
  SUCCESS: "success",
  ERROR: "error",
} as const;

export type ResponseStatus =
  (typeof RESPONSE_STATUS)[keyof typeof RESPONSE_STATUS];
