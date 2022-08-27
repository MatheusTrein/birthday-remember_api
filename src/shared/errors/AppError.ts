interface ICreateAppError {
  message: string;
  statusCode?: number;
  type?: string;
  additionalInformation?: object;
}

class AppError {
  public readonly message: string;
  public readonly statusCode: number;
  public readonly type?: string;
  public readonly additionalInformation?: object;

  constructor({
    message,
    statusCode = 400,
    type,
    additionalInformation,
  }: ICreateAppError) {
    this.message = message;
    this.statusCode = statusCode;
    this.type = type;
    this.additionalInformation = additionalInformation;
  }
}

export { AppError };
