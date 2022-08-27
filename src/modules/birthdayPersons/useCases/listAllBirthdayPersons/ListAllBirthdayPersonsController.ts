import { Request, Response } from "express";
import { container } from "tsyringe";

import { ListAllBirthdayPersonsUseCase } from "./ListAllBirthdayPersonsUseCase";

class ListAllBirthdayPersonsController {
  async handle(request: Request, response: Response): Promise<Response> {
    const { id: userId } = request.user;
    const { page, perPage } = request.query;

    const listAllBirthdayPersonsUseCase = container.resolve(
      ListAllBirthdayPersonsUseCase
    );

    const { birthdayPersons, totalCount } =
      await listAllBirthdayPersonsUseCase.execute({
        userId,
        page: Number(page),
        perPage: Number(perPage),
      });

    response.setHeader("x-total-count", totalCount);

    return response.json(birthdayPersons);
  }
}

export { ListAllBirthdayPersonsController };
