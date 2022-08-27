import { Request, Response } from "express";
import { container } from "tsyringe";

import { UpdateBirthdayPersonUseCase } from "./UpdateBirthdayPersonUseCase";

class UpdateBirthdayPersonController {
  async handle(request: Request, response: Response): Promise<Response> {
    const { id: birthdayPersonId } = request.params;
    const { name, birthDate, alarmTime } = request.body;
    const { id: userId } = request.user;

    const updateBirthdayPersonUseCase = container.resolve(
      UpdateBirthdayPersonUseCase
    );

    const updatedBirthdayPerson = await updateBirthdayPersonUseCase.execute({
      name,
      birthDate,
      birthdayPersonId,
      userId,
      alarmTime,
    });

    return response.json(updatedBirthdayPerson);
  }
}

export { UpdateBirthdayPersonController };
