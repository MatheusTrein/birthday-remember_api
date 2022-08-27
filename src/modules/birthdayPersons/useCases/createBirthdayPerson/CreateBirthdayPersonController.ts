import { Request, Response } from "express";
import { container } from "tsyringe";

import { CreateBirthdayPersonUseCase } from "./CreateBirthdayPersonUseCase";

class CreateBirthdayPersonController {
  async handle(request: Request, response: Response): Promise<Response> {
    const { name, birthDate, alarmTime } = request.body;
    const { id: userId } = request.user;

    const createBirthdayPersonUseCase = container.resolve(
      CreateBirthdayPersonUseCase
    );

    const birthdayPerson = await createBirthdayPersonUseCase.execute({
      name,
      birthDate,
      userId,
      alarmTime,
    });

    return response.status(201).json(birthdayPerson);
  }
}

export { CreateBirthdayPersonController };
