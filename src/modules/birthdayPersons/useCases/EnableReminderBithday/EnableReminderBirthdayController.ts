import { Request, Response } from "express";
import { container } from "tsyringe";

import { EnableReminderBirthdayUseCase } from "./EnableReminderBirthdayUseCase";

class EnableReminderBirthdayController {
  async handle(request: Request, response: Response): Promise<Response> {
    const { id: birthdayPersonId } = request.params;
    const { id: userId } = request.user;

    const enableReminderBirthdayUseCase = container.resolve(
      EnableReminderBirthdayUseCase
    );

    const birthdayPerson = await enableReminderBirthdayUseCase.execute({
      birthdayPersonId,
      userId,
    });

    return response.json(birthdayPerson);
  }
}

export { EnableReminderBirthdayController };
