import { Request, Response } from "express";
import { container } from "tsyringe";
import { CreateUserUseCase } from "./CreateUserUseCase";

class CreateUserController {
  async handle(request: Request, response: Response): Promise<Response> {
    const { firstName, lastName, email, password, timezoneOffSet, avatar } =
      request.body;

    const createUserUseCase = container.resolve(CreateUserUseCase);

    const user = await createUserUseCase.execute({
      firstName,
      lastName,
      email,
      password,
      timezoneOffSet,
      avatar,
    });

    return response.status(201).json(user);
  }
}

export { CreateUserController };
