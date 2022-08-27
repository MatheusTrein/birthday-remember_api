import { Request, Response } from "express";
import { container } from "tsyringe";
import requestIp from "request-ip";

import { CreateSessionUseCase } from "./CreateSessionUseCase";
import { Details } from "express-useragent";

class CreateSessionController {
  async handle(request: Request, response: Response): Promise<Response> {
    const { email, password } = request.body;
    const useragent = request.useragent as Details;
    const isMobile = useragent.isMobile || false;

    const clientIp = requestIp.getClientIp(request);

    const createSessionUseCase = container.resolve(CreateSessionUseCase);

    const tokenResponse = await createSessionUseCase.execute({
      ip: clientIp,
      isMobile,
      email,
      password,
    });

    return response.json(tokenResponse);
  }
}

export { CreateSessionController };
