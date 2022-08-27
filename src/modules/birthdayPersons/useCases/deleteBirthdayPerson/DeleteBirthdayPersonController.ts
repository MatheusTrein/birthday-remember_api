import { Request, Response } from "express";
import { container } from "tsyringe";

import { DeleteBirthdayPersonUseCase } from "./DeleteBirthdayPersonUseCase";

class DeleteBirthdayPersonController {
  async handle(request: Request, response: Response): Promise<Response> {
    const { id: birthdayPersonId } = request.params;
    const { id: userId } = request.user;

    const deleteBirthdayPersonUseCase = container.resolve(
      DeleteBirthdayPersonUseCase
    );

    await deleteBirthdayPersonUseCase.execute({
      birthdayPersonId,
      userId,
    });

    return response.status(204).json();
  }
}

export { DeleteBirthdayPersonController };
