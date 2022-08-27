import { Request, Response } from "express";
import { container } from "tsyringe";

import { DisableReminderBirthdayUseCase } from "./DisableReminderBirthdayUseCase";

class DisableReminderBirthdayController {
  async handle(request: Request, response: Response): Promise<Response> {
    const { id: birthdayPersonId } = request.params;
    const { id: userId } = request.user;

    const disableReminderBirthdayUseCase = container.resolve(
      DisableReminderBirthdayUseCase
    );

    const birthdayPerson = await disableReminderBirthdayUseCase.execute({
      birthdayPersonId,
      userId,
    });

    return response.json(birthdayPerson);
  }
}

export { DisableReminderBirthdayController };
