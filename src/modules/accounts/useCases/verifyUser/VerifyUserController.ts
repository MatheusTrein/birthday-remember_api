import { Request, Response } from "express";
import { container } from "tsyringe";

import { VerifyUserUseCase } from "./VerifyUserUseCase";

class VerifyUserController {
  async handle(request: Request, response: Response): Promise<Response> {
    const { token: verifyUserToken } = request.query;

    const verifyUserUseCase = container.resolve(VerifyUserUseCase);

    const user = await verifyUserUseCase.execute(String(verifyUserToken));

    return response.json(user);
  }
}
export { VerifyUserController };
