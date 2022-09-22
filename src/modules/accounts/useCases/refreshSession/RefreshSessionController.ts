import { Request, Response } from "express";
import { container } from "tsyringe";
import { RefreshSessionUseCase } from "./RefreshSessionUseCase";

class RefreshSessionController {
  async handle(request: Request, response: Response): Promise<Response> {
    const { refreshToken } = request.body;

    console.log(refreshToken, "refresh token body");

    const refreshSessionUseCase = container.resolve(RefreshSessionUseCase);

    const refreshTokenResponse = await refreshSessionUseCase.execute(
      refreshToken
    );

    return response.json(refreshTokenResponse);
  }
}

export { RefreshSessionController };
