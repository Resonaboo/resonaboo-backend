export class Exception extends Error {
  public readonly statusCode: number;

  constructor(statusCode = 400, message: string) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}