type AppErrorOptions = {
  code: string;
  message: string;
  statusCode: number;
};

export class AppError extends Error {
  readonly code: string;
  readonly statusCode: number;

  constructor({ code, message, statusCode }: AppErrorOptions) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.statusCode = statusCode;
  }
}
