import { Request, Response } from "express";
import { container } from "tsyringe";

import { ResetPasswordUseCase } from "./ResetPasswordUseCase";

class ResetPasswordController {
  async handle(request: Request, response: Response): Promise<Response> {
    const { token } = request.query;
    const { password } = request.body;

    const resetPasswordUseCase = container.resolve(ResetPasswordUseCase);

    await resetPasswordUseCase.execute({ password, token: token as string });

    return response.status(204).json();
  }
}

export { ResetPasswordController };
